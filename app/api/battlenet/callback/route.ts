import {
  clearStateCookie,
  getBattleNetConfig,
  matchesOAuthState,
  readBattleNetState,
  sessionCookie,
  type BattleNetAccount,
} from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

type TokenResponse = { access_token?: string };
type UserInfoResponse = { id?: number | string; battletag?: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getBattleNetConfig();
  const state = readBattleNetState(request);
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (url.searchParams.has("error") || !config.configured || !code || !matchesOAuthState(state, returnedState)) {
    return finish(request, "failed");
  }

  try {
    const tokenResponse = await fetch("https://oauth.battle.net/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: config.redirectUri }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return finish(request, "failed");
    const tokenData = (await tokenResponse.json()) as TokenResponse;
    if (!tokenData.access_token) return finish(request, "failed");

    const userResponse = await fetch("https://oauth.battle.net/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    });
    if (!userResponse.ok) return finish(request, "failed");
    const user = (await userResponse.json()) as UserInfoResponse;
    if (user.id === undefined || user.id === null) return finish(request, "failed");

    const account: BattleNetAccount = {
      id: String(user.id),
      battleTag: typeof user.battletag === "string" ? user.battletag : null,
      connectedAt: new Date().toISOString(),
    };
    return finish(request, "connected", sessionCookie(account, config.sessionSecret));
  } catch {
    return finish(request, "failed");
  }
}

function finish(request: Request, result: string, accountCookie?: string) {
  const headers = new Headers({ Location: new URL(`/?view=sync&bnet=${result}`, request.url).toString() });
  headers.append("Set-Cookie", clearStateCookie());
  if (accountCookie) headers.append("Set-Cookie", accountCookie);
  return new Response(null, { status: 303, headers });
}
