import { getBattleNetConfig, readBattleNetSession } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

const regions = ["us", "eu", "kr", "tw"] as const;
type Region = (typeof regions)[number];

type CharacterListResponse = {
  wow_accounts?: Array<{
    characters?: Array<{
      id?: number;
      name?: string;
      level?: number;
      realm?: { name?: string; slug?: string };
      playable_class?: { name?: string };
      playable_race?: { name?: string };
    }>;
  }>;
};

export async function GET(request: Request) {
  const config = getBattleNetConfig();
  if (!config.configured) return Response.json({ error: "battlenet_not_configured" }, { status: 503 });

  const session = readBattleNetSession(request, config.sessionSecret);
  if (!session) {
    return Response.json({ error: "battlenet_session_expired", message: "Reconnect Battle.net before checking a namespace." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams;
  const regionValue = query.get("region")?.toLowerCase() ?? "";
  const namespace = query.get("namespace")?.trim() ?? "";
  if (!regions.includes(regionValue as Region) || !/^[a-zA-Z0-9_-]{1,80}$/.test(namespace)) {
    return Response.json({ error: "invalid_probe", message: "Choose a region and enter a namespace identifier." }, { status: 400 });
  }

  const region = regionValue as Region;
  const endpoint = new URL(`https://${region}.api.blizzard.com/profile/user/wow`);
  endpoint.searchParams.set("namespace", namespace);
  try {
    const upstream = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (upstream.status === 404) {
      return Response.json({
        result: "not_found_or_namespace_unsupported",
        message: "Blizzard returned 404. This can mean there are no characters for this namespace or that Forever does not support it; the response does not distinguish those cases.",
        region,
        namespace,
      }, { status: 404 });
    }
    if (upstream.status === 401 || upstream.status === 403) {
      return Response.json({ error: "authorization_expired_or_scope_missing", message: "Reconnect Battle.net and approve WoW profile access." }, { status: 401 });
    }
    if (!upstream.ok) {
      return Response.json({ error: "blizzard_profile_request_failed", upstreamStatus: upstream.status }, { status: 502 });
    }

    const payload = (await upstream.json()) as CharacterListResponse;
    const characters = (payload.wow_accounts ?? []).flatMap((account) => account.characters ?? []).map((character) => ({
      id: character.id ?? null,
      primaryName: character.name ?? "Unknown name",
      secondaryName: null,
      level: character.level ?? null,
      region,
      realm: character.realm?.name ?? null,
      realmSlug: character.realm?.slug ?? null,
      characterClass: character.playable_class?.name ?? null,
      race: character.playable_race?.name ?? null,
      source: "blizzard-profile-user-wow",
      foreverCompatibility: "unverified",
    }));
    return Response.json({
      result: "response_received",
      region,
      namespace,
      accountCount: payload.wow_accounts?.length ?? 0,
      characters,
      note: "Preview only. Blizzard does not return Forever's secondary character name here, and this result has not been confirmed as Forever data.",
    });
  } catch {
    return Response.json({ error: "blizzard_profile_request_unreachable" }, { status: 502 });
  }
}
