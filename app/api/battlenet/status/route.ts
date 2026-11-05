import { getBattleNetConfig, readBattleNetSession } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const config = getBattleNetConfig();
  const session = config.configured ? readBattleNetSession(request, config.sessionSecret) : null;
  return Response.json({
    configured: config.configured,
    account: session ? {
      id: session.id,
      battleTag: session.battleTag,
      connectedAt: session.connectedAt,
    } : null,
    foreverCharacterDiscovery: "unverified",
  });
}
