import { describe, expect, it } from "vitest";
import {
  createManualProfile,
  displayRegion,
  displayRuleset,
  fullCharacterName,
  priorityTotal,
  type CharacterPlan,
} from "./character";
import { buildOptionsFor, displayBuild } from "./character-options";

const plan: CharacterPlan = {
  primaryName: "Bigcrisp",
  secondaryName: "Lolo",
  region: "US",
  ruleset: "PvP",
  faction: "Horde",
  characterClass: "Priest",
  build: "Shadow",
  priorities: { soloLeveling: 30, worldPvp: 30, damage: 20, survivability: 20 },
};

describe("character planning", () => {
  it("renders Forever's two-part character name", () => {
    expect(fullCharacterName(plan)).toBe("Bigcrisp Lolo");
  });

  it("converts a plan into a manual profile without inventing level or server", () => {
    const profile = createManualProfile(plan, "profile-1", new Date("2026-11-05T12:00:00Z"));

    expect(profile).toMatchObject({
      id: "profile-1",
      primaryName: "Bigcrisp",
      secondaryName: "Lolo",
      level: null,
      source: "manual",
    });
  });

  it("rejects invalid name lengths", () => {
    expect(() => createManualProfile({ ...plan, secondaryName: "L" }, "profile-1")).toThrow(
      "invalid plan",
    );
  });

  it("totals user preference weights", () => {
    expect(priorityTotal(plan.priorities)).toBe(100);
  });

  it("rejects preference weights that do not total 100", () => {
    expect(() =>
      createManualProfile(
        { ...plan, priorities: { ...plan.priorities, damage: 25 } },
        "profile-1",
      ),
    ).toThrow("invalid plan");
  });

  it("allows a beginner to create a profile without choosing a build", () => {
    const profile = createManualProfile({ ...plan, build: "" }, "profile-1");

    expect(profile.build).toBe("");
    expect(displayBuild(profile.build)).toBe("Build undecided");
  });

  it("provides class-specific prototype build choices", () => {
    expect(buildOptionsFor("Priest")).toContain("Shadow");
    expect(buildOptionsFor("Mage")).toContain("Frost");
    expect(buildOptionsFor("Unknown class")).toEqual([]);
  });

  it("labels Forever regions and rulesets", () => {
    expect(displayRegion("US")).toBe("Americas / Oceania");
    expect(displayRuleset("RP-PvP")).toBe("Roleplay-PvP (RP-PvP)");
    expect(displayRuleset("Hardcore")).toBe("Hardcore (planned)");
  });
});
