import { getBlizzardConfigurationStatus } from "../../../../lib/blizzard";

export const dynamic = "force-dynamic";

export function GET() {
  const status = getBlizzardConfigurationStatus();
  return Response.json({
    ...status,
    mode: "comparison-only",
    scope: "wow-forever",
    foreverCompatibility: "unverified",
  });
}
