import { getBlizzardConfigurationStatus } from "../../../../lib/blizzard";

export const dynamic = "force-dynamic";

export function GET() {
  const status = getBlizzardConfigurationStatus();
  return Response.json({
    ...status,
    mode: "public-character-lookup",
    foreverCompatibility: "unverified",
  });
}
