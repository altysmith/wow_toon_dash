import { clearSessionCookie } from "../../../../lib/battlenet-oauth";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ error: "invalid_origin" }, { status: 403 });
  }
  const headers = new Headers({ Location: new URL("/?view=sync&bnet=disconnected", request.url).toString() });
  headers.append("Set-Cookie", clearSessionCookie());
  return new Response(null, { status: 303, headers });
}
