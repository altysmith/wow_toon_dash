import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const STATE_COOKIE = "altylab_bnet_state";
const SESSION_COOKIE = "altylab_bnet_session";
const STATE_TTL_SECONDS = 600;
const MAX_SESSION_TTL_SECONDS = 60 * 60 * 24;

export type BattleNetAccount = {
  id: string;
  battleTag: string | null;
  connectedAt: string;
  accessToken: string;
  tokenExpiresAt: number;
};

export function getBattleNetConfig(environment: NodeJS.ProcessEnv = process.env) {
  const clientId = environment.BLIZZARD_CLIENT_ID?.trim() ?? "";
  const clientSecret = environment.BLIZZARD_CLIENT_SECRET?.trim() ?? "";
  const redirectUri = environment.BLIZZARD_REDIRECT_URI?.trim() ?? "";
  const sessionSecret = environment.APP_SESSION_SECRET?.trim() ?? "";
  return {
    clientId,
    clientSecret,
    redirectUri,
    sessionSecret,
    configured: Boolean(clientId && clientSecret && redirectUri && sessionSecret.length >= 32),
  };
}

export function randomOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function stateCookie(value: string) {
  return cookie(STATE_COOKIE, value, STATE_TTL_SECONDS);
}

export function clearStateCookie() {
  return cookie(STATE_COOKIE, "", 0);
}

export function readBattleNetState(request: Request) {
  return readCookie(request, STATE_COOKIE);
}

export function sessionCookie(account: BattleNetAccount, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(account), "utf8"), cipher.final()]);
  const value = [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
  const remainingSeconds = Math.max(0, Math.floor(account.tokenExpiresAt - Date.now() / 1000));
  return cookie(SESSION_COOKIE, value, Math.min(MAX_SESSION_TTL_SECONDS, remainingSeconds));
}

export function readBattleNetSession(request: Request, secret: string): BattleNetAccount | null {
  const value = readCookie(request, SESSION_COOKIE);
  if (!value) return null;
  try {
    const [ivText, tagText, encryptedText] = value.split(".");
    if (!ivText || !tagText || !encryptedText) return null;
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(secret), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const account = JSON.parse(plaintext) as BattleNetAccount;
    if (
      typeof account.id !== "string" ||
      typeof account.connectedAt !== "string" ||
      typeof account.accessToken !== "string" ||
      typeof account.tokenExpiresAt !== "number" ||
      account.tokenExpiresAt <= Date.now() / 1000
    ) return null;
    return account;
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  return cookie(SESSION_COOKIE, "", 0);
}

export function matchesOAuthState(expected: string | null, actual: string | null) {
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sessionKey(secret: string) {
  return scryptSync(secret, "altylab-wow-companion-battlenet-session-v1", 32);
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  const entry = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return null;
  }
}

function cookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
