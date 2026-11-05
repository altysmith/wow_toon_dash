import {
  BlizzardApiError,
  BlizzardConfigurationError,
  fetchBlizzardCharacter,
  isBlizzardRegion,
} from "../../../../lib/blizzard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region")?.toLowerCase() ?? "";
  const realm = searchParams.get("realm")?.trim() ?? "";
  const primaryName = searchParams.get("name")?.trim() ?? "";

  if (!isBlizzardRegion(region) || !realm || !primaryName) {
    return Response.json(
      { error: "invalid_lookup", message: "Region, realm, and primary name are required." },
      { status: 400 },
    );
  }

  try {
    const character = await fetchBlizzardCharacter({ region, realm, primaryName });
    return Response.json({ character });
  } catch (error) {
    if (error instanceof BlizzardConfigurationError) {
      return Response.json(
        {
          error: "blizzard_not_configured",
          message: "Add Blizzard API credentials on the server, then restart the app.",
          missing: error.missing,
        },
        { status: 503 },
      );
    }
    if (error instanceof BlizzardApiError) {
      const status = error.status === 404 ? 404 : 502;
      return Response.json({ error: error.code, upstreamStatus: error.status }, { status });
    }
    return Response.json({ error: "blizzard_lookup_unexpected_failure" }, { status: 500 });
  }
}
