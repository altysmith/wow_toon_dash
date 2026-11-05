import { getBattleNetConfig, readBattleNetSession } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const config = getBattleNetConfig();
  return Response.json({
    configured: config.configured,
    account: config.configured ? readBattleNetSession(request, config.sessionSecret) : null,
    foreverCharacterDiscovery: "unverified",
  });
}
