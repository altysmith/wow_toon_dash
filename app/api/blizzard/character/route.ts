export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      error: "forever_source_unverified",
      message: "Blizzard character lookup is disabled until a WoW Forever-compatible source is verified.",
    },
    { status: 410 },
  );
}
