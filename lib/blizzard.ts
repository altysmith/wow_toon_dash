export const BLIZZARD_REGIONS = ["us", "eu", "kr", "tw"] as const;
export type BlizzardRegion = (typeof BLIZZARD_REGIONS)[number];

export type BlizzardConfig = {
  clientId: string;
  clientSecret: string;
  region: BlizzardRegion;
  locale: string;
};

export type BlizzardEnvironment = Readonly<Record<string, string | undefined>>;

export type BlizzardConfigurationStatus = {
  configured: boolean;
  region: BlizzardRegion;
  locale: string;
  missing: string[];
};

export type BlizzardCharacterSummary = {
  id: number | null;
  primaryName: string;
  secondaryName: null;
  realm: string;
  realmSlug: string;
  level: number | null;
  faction: string | null;
  race: string | null;
  characterClass: string | null;
  activeSpec: string | null;
  source: "blizzard-profile-api";
  foreverCompatibility: "unverified";
  fetchedAt: string;
};

type BlizzardProfileResponse = {
  id?: number;
  name?: string;
  level?: number;
  faction?: { name?: string };
  race?: { name?: string };
  character_class?: { name?: string };
  active_spec?: { name?: string };
  realm?: { name?: string; slug?: string };
};

export class BlizzardConfigurationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing Blizzard configuration: ${missing.join(", ")}`);
    this.name = "BlizzardConfigurationError";
  }
}

export class BlizzardApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "BlizzardApiError";
  }
}

export function isBlizzardRegion(value: string): value is BlizzardRegion {
  return BLIZZARD_REGIONS.includes(value as BlizzardRegion);
}

export function getBlizzardConfigurationStatus(
  environment: BlizzardEnvironment = process.env,
): BlizzardConfigurationStatus {
  const regionValue = environment.BLIZZARD_REGION?.toLowerCase() ?? "eu";
  const region = isBlizzardRegion(regionValue) ? regionValue : "eu";
  const missing = ["BLIZZARD_CLIENT_ID", "BLIZZARD_CLIENT_SECRET"].filter(
    (name) => !environment[name]?.trim(),
  );

  return {
    configured: missing.length === 0,
    region,
    locale: environment.BLIZZARD_LOCALE?.trim() || defaultLocale(region),
    missing,
  };
}

export function readBlizzardConfig(environment: BlizzardEnvironment = process.env): BlizzardConfig {
  const status = getBlizzardConfigurationStatus(environment);
  if (!status.configured) throw new BlizzardConfigurationError(status.missing);

  return {
    clientId: environment.BLIZZARD_CLIENT_ID!.trim(),
    clientSecret: environment.BLIZZARD_CLIENT_SECRET!.trim(),
    region: status.region,
    locale: status.locale,
  };
}

export function normalizeRealmSlug(realm: string) {
  return realm.trim().toLowerCase().replace(/[’']/g, "").replace(/\s+/g, "-");
}

export function normalizeCharacterSlug(primaryName: string) {
  return primaryName.trim().toLowerCase();
}

export function characterProfileUrl(
  region: BlizzardRegion,
  realm: string,
  primaryName: string,
  locale = defaultLocale(region),
) {
  const realmSlug = normalizeRealmSlug(realm);
  const characterSlug = normalizeCharacterSlug(primaryName);
  const query = new URLSearchParams({ namespace: `profile-${region}`, locale });
  return `https://${region}.api.blizzard.com/profile/wow/character/${encodeURIComponent(realmSlug)}/${encodeURIComponent(characterSlug)}?${query}`;
}

export async function fetchBlizzardCharacter(
  input: { region: BlizzardRegion; realm: string; primaryName: string; locale?: string },
  options: {
    environment?: BlizzardEnvironment;
    fetcher?: typeof fetch;
    now?: Date;
  } = {},
): Promise<BlizzardCharacterSummary> {
  const config = readBlizzardConfig(options.environment);
  const fetcher = options.fetcher ?? fetch;
  const locale = input.locale ?? defaultLocale(input.region);
  const token = await fetchClientCredentialsToken(config, fetcher);
  const url = characterProfileUrl(input.region, input.realm, input.primaryName, locale);
  const response = await fetcher(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BlizzardApiError(response.status, "blizzard_character_lookup_failed");
  }

  const data = (await response.json()) as BlizzardProfileResponse;
  return {
    id: data.id ?? null,
    primaryName: data.name ?? input.primaryName.trim(),
    secondaryName: null,
    realm: data.realm?.name ?? input.realm.trim(),
    realmSlug: data.realm?.slug ?? normalizeRealmSlug(input.realm),
    level: data.level ?? null,
    faction: data.faction?.name ?? null,
    race: data.race?.name ?? null,
    characterClass: data.character_class?.name ?? null,
    activeSpec: data.active_spec?.name ?? null,
    source: "blizzard-profile-api",
    foreverCompatibility: "unverified",
    fetchedAt: (options.now ?? new Date()).toISOString(),
  };
}

async function fetchClientCredentialsToken(config: BlizzardConfig, fetcher: typeof fetch) {
  const authorization = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetcher("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BlizzardApiError(response.status, "blizzard_oauth_failed");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new BlizzardApiError(502, "blizzard_oauth_token_missing");
  return data.access_token;
}

function defaultLocale(region: BlizzardRegion) {
  if (region === "eu") return "en_GB";
  if (region === "kr") return "ko_KR";
  if (region === "tw") return "zh_TW";
  return "en_US";
}
