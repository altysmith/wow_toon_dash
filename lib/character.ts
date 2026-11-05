export type Region = "US" | "EU" | "KR" | "TW";
export type Ruleset = "PvP" | "Normal" | "Unknown";

export type Priorities = {
  soloLeveling: number;
  worldPvp: number;
  damage: number;
  survivability: number;
};

export type CharacterPlan = {
  primaryName: string;
  secondaryName: string;
  realm: string;
  region: Region;
  ruleset: Ruleset;
  faction: "Horde" | "Alliance";
  characterClass: string;
  build: string;
  priorities: Priorities;
};

export type CharacterProfile = CharacterPlan & {
  id: string;
  level: number | null;
  source: "manual";
  createdAt: string;
  updatedAt: string;
};

export type PlanValidation = {
  valid: boolean;
  errors: Partial<
    Record<"primaryName" | "secondaryName" | "characterClass" | "build" | "priorities", string>
  >;
};

const NAME_MIN = 2;
const NAME_MAX = 12;

export function fullCharacterName(character: Pick<CharacterPlan, "primaryName" | "secondaryName">) {
  return [character.primaryName.trim(), character.secondaryName.trim()].filter(Boolean).join(" ");
}

export function validatePlan(plan: CharacterPlan): PlanValidation {
  const errors: PlanValidation["errors"] = {};
  const primaryLength = plan.primaryName.trim().length;
  const secondaryLength = plan.secondaryName.trim().length;

  if (primaryLength < NAME_MIN || primaryLength > NAME_MAX) {
    errors.primaryName = "Use 2–12 characters for the primary name.";
  }
  if (secondaryLength < NAME_MIN || secondaryLength > NAME_MAX) {
    errors.secondaryName = "Use 2–12 characters for the secondary name.";
  }
  if (!plan.characterClass.trim()) {
    errors.characterClass = "Enter a class.";
  }
  if (!plan.build.trim()) {
    errors.build = "Enter a build or talent focus.";
  }
  if (priorityTotal(plan.priorities) !== 100) {
    errors.priorities = "Preference weights must total 100%.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function createManualProfile(
  plan: CharacterPlan,
  id: string,
  now: Date = new Date(),
): CharacterProfile {
  const validation = validatePlan(plan);
  if (!validation.valid) {
    throw new Error("Cannot create a character profile from an invalid plan.");
  }

  const timestamp = now.toISOString();
  return {
    ...plan,
    primaryName: plan.primaryName.trim(),
    secondaryName: plan.secondaryName.trim(),
    realm: plan.realm.trim(),
    characterClass: plan.characterClass.trim(),
    build: plan.build.trim(),
    id,
    level: null,
    source: "manual",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function priorityTotal(priorities: Priorities) {
  return Object.values(priorities).reduce((total, value) => total + value, 0);
}
