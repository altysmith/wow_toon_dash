// Prototype labels only. Phase 0 research must verify Forever availability,
// faction restrictions, terminology, and talent trees before recommendations use them.
export const CLASS_BUILD_OPTIONS = {
  Warrior: ["Arms", "Fury", "Protection"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Rogue: ["Assassination", "Combat", "Subtlety"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Mage: ["Arcane", "Fire", "Frost"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Druid: ["Balance", "Feral Combat", "Restoration"],
} as const;

export const CHARACTER_CLASSES = Object.keys(CLASS_BUILD_OPTIONS);

export function buildOptionsFor(characterClass: string): readonly string[] {
  return CLASS_BUILD_OPTIONS[characterClass as keyof typeof CLASS_BUILD_OPTIONS] ?? [];
}

export function displayBuild(build: string) {
  return build.trim() || "Build undecided";
}
