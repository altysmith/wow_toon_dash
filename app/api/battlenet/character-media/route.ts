import { getBattleNetConfig, readBattleNetSession } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

const regions = new Set(["us", "eu", "kr", "tw"]);
type MediaResponse = { assets?: Array<{ key?: string; value?: string }> };

export async function GET(request: Request) {
  const config = getBattleNetConfig();
  if (!config.configured) return Response.json({ error: "battlenet_not_configured" }, { status: 503 });

  const session = readBattleNetSession(request, config.sessionSecret);
  if (!session) {
    return Response.json({ error: "battlenet_session_expired", message: "Reconnect Battle.net before loading character appearance." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams;
  const region = query.get("region")?.toLowerCase() ?? "";
  const namespace = query.get("namespace")?.trim() ?? "";
  const realmSlug = query.get("realm")?.toLowerCase() ?? "";
  const characterName = query.get("name")?.trim() ?? "";
  if (!regions.has(region) || !/^[a-zA-Z0-9_-]{1,80}$/.test(namespace) || !/^[a-z0-9-]{1,80}$/.test(realmSlug) || !characterName || characterName.length > 80) {
    return Response.json({ error: "invalid_character_media_request", message: "Choose a listed character and try again." }, { status: 400 });
  }

  const characterSlug = slugify(characterName);
  if (!characterSlug) return Response.json({ error: "invalid_character_media_request", message: "This character name cannot be used to find appearance data." }, { status: 400 });

  const endpoint = new URL(`https://${region}.api.blizzard.com/profile/wow/character/${encodeURIComponent(realmSlug)}/${encodeURIComponent(characterSlug)}/character-media`);
  endpoint.searchParams.set("namespace", namespace);
  try {
    const upstream = await fetch(endpoint, { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" });
    if (upstream.status === 401 || upstream.status === 403) {
      return Response.json({ error: "authorization_expired_or_scope_missing", message: "Reconnect Battle.net and approve WoW profile access." }, { status: 401 });
    }
    if (!upstream.ok) {
      return Response.json({ error: "character_media_unavailable", message: `Blizzard did not return appearance data (${upstream.status}).` }, { status: upstream.status === 404 ? 404 : 502 });
    }

    const payload = (await upstream.json()) as MediaResponse;
    const assets = payload.assets ?? [];
    const selected = ["main-raw", "main", "bust", "avatar"].map((key) => assets.find((asset) => asset.key === key)).find((asset) => asset?.value);
    if (!selected?.value) return Response.json({ error: "character_media_missing", message: "Blizzard returned no usable character image." }, { status: 404 });

    const imageUrl = new URL(selected.value);
    if (imageUrl.protocol !== "https:" || !imageUrl.hostname.endsWith(".worldofwarcraft.com")) {
      return Response.json({ error: "unexpected_character_media_url", message: "Blizzard returned an unexpected image host." }, { status: 502 });
    }
    return Response.json({ imageUrl: imageUrl.href, assetKey: selected.key });
  } catch {
    return Response.json({ error: "character_media_request_unreachable", message: "Could not reach Blizzard's character-media API." }, { status: 502 });
  }
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
