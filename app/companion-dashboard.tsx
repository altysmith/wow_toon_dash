"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createManualProfile,
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
import type { BlizzardCharacterSummary, BlizzardRegion } from "../lib/blizzard";

type View = "overview" | "planner" | "sync";

const STORAGE_KEY = "altylab-wow-companion.prototype.v1";

const starterPlan: CharacterPlan = {
  primaryName: "Bigcrisp",
  secondaryName: "Lolo",
  realm: "",
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
        if (parsed.plan) setPlan(parsed.plan);
        if (parsed.savedPlan) setSavedPlan(parsed.savedPlan);
        if (parsed.profile) setProfile(parsed.profile);
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
            <span aria-hidden="true">↻</span> Data Sources / Sync
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
            <h1>{view === "overview" ? "Character overview" : view === "planner" ? "Character planner" : "Data sources and sync"}</h1>
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
        <SummaryCard label="Identity" value={character ? fullCharacterName(character) : "Not created"} detail={character?.realm || "Realm not set"} />
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
            <li><span>1</span><div><strong>Confirm realm and region</strong><p>Needed before attempting a character lookup.</p></div></li>
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
          <p>{profile.region} · {profile.realm || "Realm unknown"} · {profile.ruleset}</p>
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
          <Field label="Region">
            <select value={plan.region} onChange={(event) => onUpdate("region", event.target.value as Region)}>
              <option>US</option><option>EU</option><option>KR</option><option>TW</option>
            </select>
          </Field>
          <Field label="Realm / server" hint="Optional for this prototype">
            <input value={plan.realm} placeholder="Enter when known" onChange={(event) => onUpdate("realm", event.target.value)} />
          </Field>
          <Field label="Ruleset">
            <select value={plan.ruleset} onChange={(event) => onUpdate("ruleset", event.target.value as Ruleset)}>
              <option>PvP</option><option>Normal</option><option>Unknown</option>
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
          <div className="preview-meta"><span>{plan.region}</span><span>{plan.realm || "Realm unknown"}</span><span>{plan.ruleset}</span></div>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Data boundary</p>
          <h3>No automatic lookup yet</h3>
          <p>Realm and region are required before we can test a supported character lookup. The profile remains useful with manual updates.</p>
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

type BlizzardStatus = {
  configured: boolean;
  region: BlizzardRegion;
  locale: string;
};

function BlizzardSync({ plan }: { plan: CharacterPlan }) {
  const initialRegion = plan.region.toLowerCase();
  const [region, setRegion] = useState<BlizzardRegion>(
    initialRegion === "eu" || initialRegion === "kr" || initialRegion === "tw" ? initialRegion : "us",
  );
  const [realm, setRealm] = useState(plan.realm);
  const [primaryName, setPrimaryName] = useState(plan.primaryName);
  const [status, setStatus] = useState<BlizzardStatus | null>(null);
  const [result, setResult] = useState<BlizzardCharacterSummary | null>(null);
  const [message, setMessage] = useState("Checking whether the Blizzard API is configured…");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/blizzard/status")
      .then(async (response) => {
        const body = (await response.json()) as BlizzardStatus;
        if (active) {
          setStatus(body);
          setMessage(body.configured ? "Blizzard API credentials are available on this server." : "Add Blizzard API credentials to enable lookup.");
        }
      })
      .catch(() => active && setMessage("Could not check the Blizzard API configuration."));
    return () => { active = false; };
  }, []);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setMessage("Looking up the character…");
    try {
      const query = new URLSearchParams({ region, realm, name: primaryName });
      const response = await fetch(`/api/blizzard/character?${query}`);
      const body = (await response.json()) as { character?: BlizzardCharacterSummary; error?: string; message?: string };
      if (!response.ok || !body.character) throw new Error(body.message || body.error || "Character lookup failed.");
      setResult(body.character);
      setMessage("Character found. Review the Blizzard data below before using it in a profile.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Character lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sync-layout">
      <section className="panel sync-intro">
        <p className="eyebrow">First integration slice</p>
        <h2>Look up one public character</h2>
        <p>This tests Blizzard&apos;s official character profile API with a region, realm, and primary character name. It does not ask for your Battle.net password or browser cookies.</p>
        <div className={status?.configured ? "sync-state" : "sync-state sync-warning"}>{message}</div>

        <form className="sync-form" onSubmit={lookup}>
          <Field label="Region">
            <select value={region} onChange={(event) => setRegion(event.target.value as BlizzardRegion)}>
              <option value="us">Americas (US)</option>
              <option value="eu">Europe (EU)</option>
              <option value="kr">Korea (KR)</option>
              <option value="tw">Taiwan (TW)</option>
            </select>
          </Field>
          <Field label="Realm">
            <input value={realm} onChange={(event) => setRealm(event.target.value)} placeholder="Blackrock" required />
          </Field>
          <Field label="Primary character name" hint="Blizzard lookup key">
            <input value={primaryName} onChange={(event) => setPrimaryName(event.target.value)} placeholder="Bigcrisp" required />
          </Field>
          <button className="primary-button" disabled={loading || !status?.configured} type="submit">
            {loading ? "Looking up…" : "Look up character"}
          </button>
        </form>

        {result && (
          <article className="sync-result">
            <p className="eyebrow">Official Blizzard profile response</p>
            <h3>{result.primaryName} <span>{result.secondaryName ?? "Secondary name not returned"}</span></h3>
            <dl>
              <div><dt>Realm</dt><dd>{result.realm}</dd></div>
              <div><dt>Level</dt><dd>{result.level ?? "Unknown"}</dd></div>
              <div><dt>Race</dt><dd>{result.race ?? "Unknown"}</dd></div>
              <div><dt>Class</dt><dd>{result.characterClass ?? "Unknown"}</dd></div>
              <div><dt>Active spec</dt><dd>{result.activeSpec ?? "Unknown"}</dd></div>
            </dl>
            <p className="result-note">Forever compatibility is unverified. This preview does not overwrite your manual profile.</p>
          </article>
        )}
      </section>

      <aside className="sync-side">
        <section className="panel compact-panel">
          <p className="eyebrow">Setup</p>
          <h3>Developer credentials stay private</h3>
          <ol className="setup-steps">
            <li>Create an application at develop.battle.net.</li>
            <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
            <li>Add the client ID and secret locally, then restart the app.</li>
          </ol>
          <p>Never paste the client secret into chat or commit it to GitHub.</p>
        </section>
        <section className="panel compact-panel">
          <p className="eyebrow">Next slice</p>
          <h3>Account connection</h3>
          <p>After this public lookup works, Battle.net OAuth can discover characters tied to an authorized account where Blizzard supports it.</p>
        </section>
      </aside>
    </div>
  );
}
