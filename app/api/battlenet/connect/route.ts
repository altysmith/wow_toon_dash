import { getBattleNetConfig, randomOAuthState, stateCookie } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const config = getBattleNetConfig();
  if (!config.configured || !isAllowedRedirectUri(config.redirectUri)) {
    return Response.redirect(new URL("/?view=sync&bnet=not-configured", request.url));
  }

  const state = randomOAuthState();
  const authorize = new URL("https://oauth.battle.net/authorize");
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("redirect_uri", config.redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "wow.profile");
  authorize.searchParams.set("state", state);
  const headers = new Headers({ Location: authorize.toString() });
  headers.append("Set-Cookie", stateCookie(state));
  return new Response(null, { status: 302, headers });
}

function isAllowedRedirectUri(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
