import { describe, expect, it, vi } from "vitest";
import {
  BlizzardConfigurationError,
  characterProfileUrl,
  fetchBlizzardCharacter,
  getBlizzardConfigurationStatus,
  normalizeRealmSlug,
} from "./blizzard";

describe("Blizzard profile adapter", () => {
  it("reports missing credentials without exposing values", () => {
    expect(getBlizzardConfigurationStatus({ BLIZZARD_REGION: "eu" })).toEqual({
      configured: false,
      region: "eu",
      locale: "en_GB",
      missing: ["BLIZZARD_CLIENT_ID", "BLIZZARD_CLIENT_SECRET"],
    });
  });

  it("normalizes realm slugs and builds a regional profile URL", () => {
    expect(normalizeRealmSlug("Black Rock's")).toBe("black-rocks");
    expect(characterProfileUrl("eu", "Blackrock", "Bigcrisp")).toBe(
      "https://eu.api.blizzard.com/profile/wow/character/blackrock/bigcrisp?namespace=profile-eu&locale=en_GB",
    );
  });

  it("refuses a lookup when server credentials are missing", async () => {
    await expect(
      fetchBlizzardCharacter(
        { region: "eu", realm: "Blackrock", primaryName: "Bigcrisp" },
        { environment: {} },
      ),
    ).rejects.toBeInstanceOf(BlizzardConfigurationError);
  });

  it("uses server credentials and normalizes a public character response", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "temporary-token" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 42,
            name: "Bigcrisp",
            level: 18,
            faction: { name: "Horde" },
            race: { name: "Troll" },
            character_class: { name: "Priest" },
            active_spec: { name: "Shadow" },
            realm: { name: "Blackrock", slug: "blackrock" },
          }),
        ),
      );

    const result = await fetchBlizzardCharacter(
      { region: "eu", realm: "Blackrock", primaryName: "Bigcrisp" },
      {
        environment: {
          BLIZZARD_CLIENT_ID: "client-id",
          BLIZZARD_CLIENT_SECRET: "client-secret",
        },
        fetcher,
        now: new Date("2026-11-05T15:30:00Z"),
      },
    );

    expect(result).toMatchObject({
      id: 42,
      primaryName: "Bigcrisp",
      secondaryName: null,
      realm: "Blackrock",
      level: 18,
      source: "blizzard-profile-api",
      foreverCompatibility: "unverified",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1]?.[1]?.headers).toEqual({ Authorization: "Bearer temporary-token" });
  });
});
