"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createManualProfile,
  displayRegion,
  displayRuleset,
  fullCharacterName,
  priorityTotal,
  validatePlan,
  type CharacterPlan,
  type CharacterProfile,
  type Priorities,
  type Region,
  type Ruleset,
} from "../lib/character";
import { CHARACTER_CLASSES, buildOptionsFor, displayBuild } from "../lib/character-options";

type View = "overview" | "planner" | "sync";

const STORAGE_KEY = "altylab-wow-companion.prototype.v1";

const starterPlan: CharacterPlan = {
  primaryName: "Bigcrisp",
  secondaryName: "Lolo",
  region: "US",
  ruleset: "PvP",
  faction: "Horde",
  characterClass: "Priest",
  build: "",
  priorities: {
    soloLeveling: 30,
    worldPvp: 30,
    damage: 20,
    survivability: 20,
  },
};

const plannedSections = ["Builds & Talents", "Leveling", "Gear", "Professions"];
const leftEquipmentSlots = ["Head", "Neck", "Shoulders", "Back", "Chest", "Wrists"];
const rightEquipmentSlots = ["Hands", "Waist", "Legs", "Feet", "Ring", "Weapon"];

function stripLegacyRealm<T extends object>(value: T): Omit<T, "realm"> {
  const { realm: _legacyRealm, ...current } = value as T & { realm?: unknown };
  return current as Omit<T, "realm">;
}

export function CompanionDashboard() {
  const [view, setView] = useState<View>("overview");
  const [plan, setPlan] = useState<CharacterPlan>(starterPlan);
  const [savedPlan, setSavedPlan] = useState<CharacterPlan | null>(null);
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [notice, setNotice] = useState("Prototype draft loaded for Bigcrisp Lolo.");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          plan?: CharacterPlan;
          savedPlan?: CharacterPlan | null;
          profile?: CharacterProfile | null;
        };
        if (parsed.plan) setPlan({ ...starterPlan, ...stripLegacyRealm(parsed.plan) });
        if (parsed.savedPlan) setSavedPlan(stripLegacyRealm(parsed.savedPlan));
        if (parsed.profile) setProfile(stripLegacyRealm(parsed.profile));
        setNotice("Restored your prototype data from this browser.");
      } catch {
        setNotice("Stored prototype data could not be read, so the starter draft was loaded.");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, savedPlan, profile }));
  }, [hydrated, plan, savedPlan, profile]);

  const validation = useMemo(() => validatePlan(plan), [plan]);
  const total = priorityTotal(plan.priorities);

  function updatePlan<Key extends keyof CharacterPlan>(key: Key, value: CharacterPlan[Key]) {
    setPlan((current) => ({ ...current, [key]: value }));
  }

  function updatePriority(key: keyof Priorities, value: number) {
    setPlan((current) => ({
      ...current,
      priorities: { ...current.priorities, [key]: value },
    }));
  }

  function savePlan() {
    if (!validation.valid) {
      setNotice("Fix the highlighted fields before saving this plan.");
      return;
    }
    setSavedPlan(plan);
    setNotice(`Saved the ${fullCharacterName(plan)} character plan in this browser.`);
  }

  function createProfile() {
    if (!validation.valid) {
      setNotice("Fix the highlighted fields before creating a profile.");
      return;
    }
    const nextProfile = createManualProfile(plan, crypto.randomUUID());
    setSavedPlan(plan);
    setProfile(nextProfile);
    setView("overview");
    setNotice(`Created a manual profile for ${fullCharacterName(nextProfile)}.`);
  }

  function updateLevel(level: number | null) {
    if (!profile) return;
    setProfile({ ...profile, level, updatedAt: new Date().toISOString() });
    setNotice(level === null ? "Cleared the manually entered level." : `Updated ${fullCharacterName(profile)} to level ${level}.`);
  }

  function clearPrototype() {
    setPlan(starterPlan);
    setSavedPlan(null);
    setProfile(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setNotice("Reset the local prototype to the Bigcrisp Lolo starter draft.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <div>
            <strong>AltyLab</strong>
            <span>WoW Companion</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <button className={view === "overview" ? "nav-item active" : "nav-item"} onClick={() => setView("overview")}>
            <span aria-hidden="true">⌂</span> Overview
          </button>
          <button className={view === "planner" ? "nav-item active" : "nav-item"} onClick={() => setView("planner")}>
            <span aria-hidden="true">✦</span> Character Planner
          </button>
          <button className={view === "sync" ? "nav-item active" : "nav-item"} onClick={() => setView("sync")}>
            <span aria-hidden="true">↻</span> Forever Data Research
          </button>
          {plannedSections.map((section) => (
            <button className="nav-item planned" disabled key={section}>
              <span aria-hidden="true">·</span> {section}<small>Planned</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="status-dot" aria-hidden="true" />
          Local prototype
          <small>Browser storage only</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">World of Warcraft: Forever</p>
            <h1>{view === "overview" ? "Character overview" : view === "planner" ? "Character planner" : "Forever data research"}</h1>
          </div>
          <div className="prototype-badge">Prototype · Unverified game data</div>
        </header>

        <div className="notice" role="status">{notice}</div>

        {view === "overview" ? (
          <Overview profile={profile} savedPlan={savedPlan} onPlan={() => setView("planner")} onLevel={updateLevel} />
        ) : view === "planner" ? (
          <Planner
            plan={plan}
            validation={validation}
            total={total}
            onUpdate={updatePlan}
            onPriority={updatePriority}
            onSave={savePlan}
            onCreateProfile={createProfile}
          />
        ) : (
          <BlizzardSync plan={plan} />
        )}

        <footer className="page-footer">
          <span>Prototype data stays in this browser.</span>
          <button onClick={clearPrototype}>Reset prototype</button>
        </footer>
      </main>
    </div>
  );
}

function Overview({
  profile,
  savedPlan,
  onPlan,
  onLevel,
}: {
  profile: CharacterProfile | null;
  savedPlan: CharacterPlan | null;
  onPlan: () => void;
  onLevel: (level: number | null) => void;
}) {
  const character = profile ?? savedPlan;

  return (
    <div className="content-stack">
      {profile ? (
        <CharacterSheet profile={profile} onEdit={onPlan} />
      ) : (
        <section className="hero-card">
          <div>
            <p className="eyebrow">{savedPlan ? "Saved character plan" : "Start here"}</p>
            <h2>{character ? fullCharacterName(character) : "Plan your first character"}</h2>
            <p className="hero-copy">
              {character
                ? `${character.faction} ${character.characterClass} · ${displayBuild(character.build)} · ${character.ruleset}`
                : "Choose your character identity and priorities, then turn the plan into a trackable profile."}
            </p>
          </div>
          <button className="primary-button" onClick={onPlan}>
            {character ? "Edit character plan" : "Create character plan"}
          </button>
        </section>
      )}

      <div className="summary-grid">
        <SummaryCard label="Identity" value={character ? fullCharacterName(character) : "Not created"} detail={character ? `${displayRegion(character.region)} · ${displayRuleset(character.ruleset)}` : "Region and ruleset not set"} />
        <SummaryCard label="Progress" value={profile?.level ? `Level ${profile.level}` : "Unknown level"} detail={profile ? "Manual updates enabled" : "Create a profile to track"} />
        <SummaryCard label="Sync" value="Not connected" detail="Manual entry remains available" tone="warning" />
        <SummaryCard label="Data quality" value="Prototype" detail="No game claims verified yet" tone="warning" />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Next useful actions</p>
              <h3>Progress checklist</h3>
            </div>
            <span className="count-badge">3</span>
          </div>
          <ol className="action-list">
            <li><span>1</span><div><strong>Confirm region and ruleset</strong><p>Forever uses rulesets with regional mega-server layers.</p></div></li>
            <li><span>2</span><div><strong>Add current level</strong><p>Manual entry prevents the dashboard from guessing.</p></div></li>
            <li><span>3</span><div><strong>Verify Forever data sources</strong><p>Race and build advice stays locked until sourced.</p></div></li>
          </ol>
          {profile && (
            <label className="level-control">
              <span><strong>Current level</strong><small>Manual update · Forever cap 60</small></span>
              <input
                aria-label="Current character level"
                type="number"
                min="1"
                max="60"
                placeholder="Unknown"
                value={profile.level ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onLevel(value ? Math.max(1, Math.min(60, Number(value))) : null);
                }}
              />
            </label>
          )}
        </section>

        <section className="panel evidence-panel">
          <p className="eyebrow">Recommendation status</p>
          <h3>Waiting for verified game data</h3>
          <p>
            The prototype records what matters to you, but it will not rank races, talents, or gear using Classic or Retail assumptions.
          </p>
          <div className="confidence-row"><span>Identity</span><strong className={character ? "good" : "muted"}>{character ? "Entered" : "Missing"}</strong></div>
          <div className="confidence-row"><span>Priorities</span><strong className={savedPlan ? "good" : "muted"}>{savedPlan ? "Saved" : "Draft"}</strong></div>
          <div className="confidence-row"><span>Forever sources</span><strong className="warning-text">Research needed</strong></div>
        </section>
      </div>
    </div>
  );
}

function CharacterSheet({ profile, onEdit }: { profile: CharacterProfile; onEdit: () => void }) {
  const initials = `${profile.primaryName.charAt(0)}${profile.secondaryName.charAt(0)}`.toUpperCase();

  return (
    <section className="character-sheet" aria-labelledby="character-sheet-name">
      <div className="character-sheet-header">
        <span className={`faction-crest ${profile.faction.toLowerCase()}`} aria-hidden="true">
          {profile.faction === "Horde" ? "H" : "A"}
        </span>
        <div className="character-title">
          <p className="eyebrow">Manual character profile</p>
          <h2 id="character-sheet-name">{fullCharacterName(profile)}</h2>
          <p>{displayRegion(profile.region)} · {displayRuleset(profile.ruleset)} · Realmless mega-server</p>
        </div>
        <div className="character-stats" aria-label="Character summary">
          <span><small>Level</small><strong>{profile.level ?? "—"}</strong></span>
          <span><small>Class</small><strong>{profile.characterClass}</strong></span>
          <span><small>Focus</small><strong>{displayBuild(profile.build)}</strong></span>
        </div>
        <button className="sheet-edit-button" onClick={onEdit}>Edit profile</button>
      </div>

      <div className="sheet-tabs" role="tablist" aria-label="Character sections">
        <button className="active" role="tab" aria-selected="true">Character</button>
        <button role="tab" aria-selected="false" disabled>Talents <small>Planned</small></button>
        <button role="tab" aria-selected="false" disabled>Progress <small>Planned</small></button>
        <button role="tab" aria-selected="false" disabled>History <small>Planned</small></button>
      </div>

      <div className="character-stage">
        <EquipmentColumn slots={leftEquipmentSlots} side="left" />
        <div className="character-figure">
          <div className="figure-glow" aria-hidden="true" />
          <div className="figure-medallion" aria-hidden="true">{initials}</div>
          <strong>Character appearance unavailable</strong>
          <p>A future supported import can place character art or a model here.</p>
          <span className="manual-data-badge">Manual data</span>
        </div>
        <EquipmentColumn slots={rightEquipmentSlots} side="right" />
      </div>
    </section>
  );
}

function EquipmentColumn({ slots, side }: { slots: string[]; side: "left" | "right" }) {
  return (
    <ul className={`equipment-column ${side}`} aria-label={`${side} equipment slots`}>
      {slots.map((slot) => (
        <li key={slot}>
          <span className="empty-slot" aria-hidden="true">—</span>
          <div><strong>{slot}</strong><small>No item recorded</small></div>
        </li>
      ))}
    </ul>
  );
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: "warning" }) {
  return (
    <section className="summary-card">
      <span className={tone === "warning" ? "card-icon warning" : "card-icon"} aria-hidden="true">{tone === "warning" ? "!" : "✦"}</span>
      <div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div>
    </section>
  );
}

function Planner({
  plan,
  validation,
  total,
  onUpdate,
  onPriority,
  onSave,
  onCreateProfile,
}: {
  plan: CharacterPlan;
  validation: ReturnType<typeof validatePlan>;
  total: number;
  onUpdate: <Key extends keyof CharacterPlan>(key: Key, value: CharacterPlan[Key]) => void;
  onPriority: (key: keyof Priorities, value: number) => void;
  onSave: () => void;
  onCreateProfile: () => void;
}) {
  return (
    <div className="planner-layout">
      <form className="panel form-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="panel-heading">
          <div><p className="eyebrow">Forever identity</p><h2>Who are we planning for?</h2></div>
          <span className="step-badge">Step 1 of 2</span>
        </div>
        <p className="supporting-copy">Forever uses a primary and secondary name. The exact official validation rules still need verification.</p>

        <div className="field-grid">
          <Field label="Primary name" error={validation.errors.primaryName}>
            <input value={plan.primaryName} minLength={2} maxLength={12} onChange={(event) => onUpdate("primaryName", event.target.value)} />
          </Field>
          <Field label="Secondary name" error={validation.errors.secondaryName}>
            <input value={plan.secondaryName} minLength={2} maxLength={12} onChange={(event) => onUpdate("secondaryName", event.target.value)} />
          </Field>
          <Field label="Region" hint="Forever regional ecosystem">
            <select value={plan.region} onChange={(event) => onUpdate("region", event.target.value as Region)}>
              <option value="US">Americas / Oceania</option>
              <option value="EU">Europe</option>
              <option value="KR">Korea</option>
              <option value="TW">Taiwan</option>
            </select>
          </Field>
          <Field label="Ruleset" hint="Mega-server type">
            <select value={plan.ruleset} onChange={(event) => onUpdate("ruleset", event.target.value as Ruleset)}>
              <option value="Normal">Normal (PvE)</option>
              <option value="PvP">PvP</option>
              <option value="RP">Roleplay (RP)</option>
              <option value="RP-PvP">Roleplay-PvP (RP-PvP)</option>
              <option value="Hardcore">Hardcore (planned)</option>
              <option value="Unknown">Not selected</option>
            </select>
          </Field>
          <Field label="Faction">
            <select value={plan.faction} onChange={(event) => onUpdate("faction", event.target.value as "Horde" | "Alliance")}>
              <option>Horde</option><option>Alliance</option>
            </select>
          </Field>
          <Field label="Class" hint="Prototype list; verification pending" error={validation.errors.characterClass}>
            <select
              value={plan.characterClass}
              onChange={(event) => {
                const nextClass = event.target.value;
                onUpdate("characterClass", nextClass);
                if (!buildOptionsFor(nextClass).includes(plan.build)) onUpdate("build", "");
              }}
            >
              <option value="" disabled>Choose a class</option>
              {CHARACTER_CLASSES.map((characterClass) => <option key={characterClass}>{characterClass}</option>)}
            </select>
          </Field>
          <Field label="Build / talent focus" hint="Optional">
            <select
              value={plan.build}
              disabled={!plan.characterClass}
              onChange={(event) => onUpdate("build", event.target.value)}
            >
              <option value="">Not sure yet</option>
              {buildOptionsFor(plan.characterClass).map((build) => <option key={build}>{build}</option>)}
            </select>
          </Field>
        </div>

        <div className="divider" />
        <div className="panel-heading compact">
          <div><p className="eyebrow">Playstyle</p><h2>What matters most?</h2></div>
          <span className={total === 100 ? "total-badge good" : "total-badge"}>{total}% total</span>
        </div>
        <p className="supporting-copy">These are your preferences. They are not measured performance percentages.</p>

        <div className="priority-list">
          <Priority label="Solo leveling" value={plan.priorities.soloLeveling} onChange={(value) => onPriority("soloLeveling", value)} />
          <Priority label="World PvP" value={plan.priorities.worldPvp} onChange={(value) => onPriority("worldPvp", value)} />
          <Priority label="Damage" value={plan.priorities.damage} onChange={(value) => onPriority("damage", value)} />
          <Priority label="Survivability" value={plan.priorities.survivability} onChange={(value) => onPriority("survivability", value)} />
        </div>
        {validation.errors.priorities && <p className="form-error">{validation.errors.priorities}</p>}

        <div className="form-actions">
          <button className="secondary-button" type="button" disabled={!validation.valid} onClick={onSave}>Save plan</button>
          <button className="primary-button" type="button" disabled={!validation.valid} onClick={onCreateProfile}>Save and create profile</button>
        </div>
      </form>

      <aside className="preview-column">
        <section className="character-preview">
          <span className="preview-rune" aria-hidden="true">✦</span>
          <p className="eyebrow">Live preview</p>
          <h2>{fullCharacterName(plan) || "Unnamed character"}</h2>
          <p>{plan.faction} {plan.characterClass} · {displayBuild(plan.build)}</p>
          <div className="preview-meta"><span>{displayRegion(plan.region)}</span><span>Realmless mega-server</span><span>{displayRuleset(plan.ruleset)}</span></div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Data boundary</p>
          <h3>No automatic lookup yet</h3>
          <p>Forever character data must come from a verified Forever source. The profile remains useful with manual updates.</p>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Race recommendation</p>
          <h3>Locked pending sources</h3>
          <p>Verified Forever race eligibility and racial abilities will be added after Phase 0 research.</p>
        </section>
      </aside>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}{hint && <small>{hint}</small>}</span>
      {children}
      {error && <em>{error}</em>}
    </label>
  );
}

function Priority({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="priority">
      <span><strong>{label}</strong><output>{value}%</output></span>
      <input type="range" min="0" max="100" step="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function BlizzardSync({ plan }: { plan: CharacterPlan }) {
  return (
    <div className="sync-layout">
      <section className="panel sync-intro">
        <p className="eyebrow">WoW Forever only</p>
        <h2>Server data research</h2>
        <p>This dashboard is scoped to World of Warcraft: Forever. Its servers, naming rules, game data, and available integrations must be researched as Forever-specific sources.</p>
        <div className="sync-state sync-warning">Live lookup is paused until a Forever-compatible API, addon export, or server data source is verified.</div>
        <article className="sync-result">
          <p className="eyebrow">Current manual identity</p>
          <h3>{fullCharacterName(plan)}</h3>
          <dl>
            <div><dt>Server model</dt><dd>Realmless</dd></div>
            <div><dt>Region</dt><dd>{displayRegion(plan.region)}</dd></div>
            <div><dt>Ruleset</dt><dd>{displayRuleset(plan.ruleset)}</dd></div>
          </dl>
          <p className="result-note">No Retail, Classic, or Worldsoul Armory result will be treated as WoW Forever data.</p>
        </article>
      </section>

      <aside className="sync-side">
        <section className="panel compact-panel">
          <p className="eyebrow">Research checklist</p>
          <h3>What must be verified</h3>
          <ol className="setup-steps">
            <li>Confirm the Forever region and ruleset.</li>
            <li>Find an authorized Forever data source or addon export.</li>
            <li>Verify primary and secondary name fields against Forever behavior.</li>
          </ol>
          <p>Manual entry remains available while this research is incomplete.</p>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Scope rule</p>
          <h3>Forever sources only</h3>
          <p>Any future sync adapter must name its Forever source and document its coverage before it can update a character profile.</p>
        </section>
      </aside>
    </div>
  );
}
