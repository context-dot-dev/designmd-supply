import { createClient, type Client } from "@libsql/client";

export type CacheKind =
  | "styleguide"
  | "brand"
  | "screenshot"
  | "markdown"
  | "designmd";

// Single shared client + one-shot init promise. Callers race through
// `ensureInitialized` so the CREATE TABLE statement runs at most once
// per process — subsequent calls await the same resolved promise.
let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client | null {
  const url = process.env.designmd_TURSO_DATABASE_URL;
  const authToken = process.env.designmd_TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  if (!client) {
    client = createClient({ url, authToken });
  }
  return client;
}

function ensureInitialized(c: Client): Promise<void> {
  if (!initPromise) {
    initPromise = c
      .execute(
        `CREATE TABLE IF NOT EXISTS domain_cache (
          domain TEXT NOT NULL,
          kind TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (domain, kind)
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        // Reset so a later request can retry init instead of being permanently
        // poisoned by a transient connection failure at boot.
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

export function isTursoEnabled(): boolean {
  return !!(
    process.env.designmd_TURSO_DATABASE_URL &&
    process.env.designmd_TURSO_AUTH_TOKEN
  );
}

export async function getCached<T>(
  domain: string,
  kind: CacheKind,
): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    await ensureInitialized(c);
    const result = await c.execute({
      sql: "SELECT value FROM domain_cache WHERE domain = ? AND kind = ? LIMIT 1",
      args: [domain, kind],
    });
    const row = result.rows[0];
    if (!row) return null;
    const raw = row.value as string;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCached(
  domain: string,
  kind: CacheKind,
  value: unknown,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    await ensureInitialized(c);
    await c.execute({
      sql: `INSERT INTO domain_cache (domain, kind, value, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(domain, kind) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at`,
      args: [domain, kind, JSON.stringify(value), Date.now()],
    });
  } catch {
    // Cache writes are best-effort — never let them break the response.
  }
}

// Distinct domains that have a designmd row — used by generateStaticParams to
// pre-render only the pages we actually have content for.
export async function listDomainsWithDesignMd(): Promise<string[]> {
  const c = getClient();
  if (!c) return [];
  try {
    await ensureInitialized(c);
    const result = await c.execute(
      "SELECT domain FROM domain_cache WHERE kind = 'designmd'",
    );
    return result.rows.map((r) => r.domain as string);
  } catch {
    return [];
  }
}

// Bulk read multiple kinds for a fixed list of domains in a single round trip.
// Returns Map<domain, Map<kind, value>>; missing entries are simply absent.
export async function getCachedBatch<T = unknown>(
  domains: string[],
  kinds: CacheKind[],
): Promise<Map<string, Map<CacheKind, T>>> {
  const out = new Map<string, Map<CacheKind, T>>();
  if (!domains.length || !kinds.length) return out;
  const c = getClient();
  if (!c) return out;
  try {
    await ensureInitialized(c);
    const domainPlaceholders = domains.map(() => "?").join(",");
    const kindPlaceholders = kinds.map(() => "?").join(",");
    const result = await c.execute({
      sql: `SELECT domain, kind, value FROM domain_cache
            WHERE domain IN (${domainPlaceholders})
              AND kind IN (${kindPlaceholders})`,
      args: [...domains, ...kinds],
    });
    for (const row of result.rows) {
      const domain = row.domain as string;
      const kind = row.kind as CacheKind;
      const raw = row.value as string;
      let parsed: T;
      try {
        parsed = JSON.parse(raw) as T;
      } catch {
        continue;
      }
      let bucket = out.get(domain);
      if (!bucket) {
        bucket = new Map();
        out.set(domain, bucket);
      }
      bucket.set(kind, parsed);
    }
    return out;
  } catch {
    return out;
  }
}
