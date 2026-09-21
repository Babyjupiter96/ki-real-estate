import { Pool, types } from "pg";

// Return timestamp columns as raw strings (not JS Date objects) so the rest
// of the app can keep treating dates as plain ISO-ish strings, matching the
// shape the SQLite version used to produce.
types.setTypeParser(1114, (val) => val); // timestamp
types.setTypeParser(1184, (val) => val); // timestamptz

declare global {
  var __kiPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add a Postgres connection string to .env.local."
  );
}

export const pool =
  global.__kiPool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__kiPool = pool;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL DEFAULT 'manual',
    intent TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    property_address TEXT NOT NULL DEFAULT '',
    property_type TEXT NOT NULL DEFAULT '',
    estimated_value TEXT NOT NULL DEFAULT '',
    timeline TEXT NOT NULL DEFAULT '',
    industry TEXT NOT NULL DEFAULT '',
    seo_situation TEXT NOT NULL DEFAULT '',
    budget TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    next_follow_up_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    last_reminder_sent_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    body TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_activity (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    meta TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS page_events (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '',
    session_id TEXT NOT NULL DEFAULT '',
    meta TEXT NOT NULL DEFAULT '{}'
  );

  CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
  CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(next_follow_up_at);
  CREATE INDEX IF NOT EXISTS idx_page_events_type ON page_events(type);
  CREATE INDEX IF NOT EXISTS idx_page_events_created ON page_events(created_at);
  CREATE INDEX IF NOT EXISTS idx_contact_activity_contact ON contact_activity(contact_id);

  ALTER TABLE contacts ADD COLUMN IF NOT EXISTS session_id TEXT NOT NULL DEFAULT '';
  CREATE INDEX IF NOT EXISTS idx_page_events_session ON page_events(session_id);

  CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    scope TEXT NOT NULL DEFAULT 'read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    request_count INTEGER NOT NULL DEFAULT 0
  );
`;

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool.query(SCHEMA_SQL).then(
      () => undefined,
      (err) => {
        schemaReady = null;
        throw err;
      }
    );
  }
  return schemaReady;
}

export async function query<T extends object = never>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T extends object = never>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

export type ContactStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type Contact = {
  id: number;
  created_at: string;
  updated_at: string;
  source: "manual" | "lead_form";
  intent: string | null;
  status: ContactStatus;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  notes: string;
  property_address: string;
  property_type: string;
  estimated_value: string;
  timeline: string;
  industry: string;
  seo_situation: string;
  budget: string;
  message: string;
  session_id: string;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  last_reminder_sent_at: string | null;
};

export type ContactNote = {
  id: number;
  contact_id: number;
  created_at: string;
  body: string;
};

export type ContactActivity = {
  id: number;
  contact_id: number | null;
  created_at: string;
  type: string;
  meta: string;
};

export type PageEvent = {
  id: number;
  created_at: string;
  type: string;
  path: string;
  session_id: string;
  meta: string;
};

export type ApiKeyScope = "read" | "read_write";

export type ApiKey = {
  id: number;
  name: string;
  key_prefix: string;
  scope: ApiKeyScope;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  request_count: number;
};

export async function logActivity(
  contactId: number | null,
  type: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  await query(
    `INSERT INTO contact_activity (contact_id, type, meta) VALUES ($1, $2, $3)`,
    [contactId, type, JSON.stringify(meta)]
  );
}

export async function logPageEvent(
  type: string,
  path: string,
  sessionId: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  await query(
    `INSERT INTO page_events (type, path, session_id, meta) VALUES ($1, $2, $3, $4)`,
    [type, path, sessionId, JSON.stringify(meta)]
  );
}
