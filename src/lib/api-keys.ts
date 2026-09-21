import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { query, queryOne, type ApiKey, type ApiKeyScope } from "./db";

const KEY_PREFIX = "ki_live_";
const PUBLIC_COLUMNS =
  "id, name, key_prefix, scope, created_at, last_used_at, revoked_at, request_count";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Keys are 192 bits of randomness, so a fast SHA-256 is sufficient (unlike
// passwords, there is nothing to brute-force). Only the hash is stored; the
// plaintext key is returned once at creation and can never be recovered.
export async function createApiKey(
  name: string,
  scope: ApiKeyScope
): Promise<{ key: string; record: ApiKey }> {
  const key = KEY_PREFIX + randomBytes(24).toString("base64url");
  const record = await queryOne<ApiKey>(
    `INSERT INTO api_keys (name, key_prefix, key_hash, scope)
     VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
    [name, key.slice(0, 12), hashKey(key), scope]
  );
  return { key, record: record! };
}

export async function listApiKeys(): Promise<ApiKey[]> {
  return query<ApiKey>(`SELECT ${PUBLIC_COLUMNS} FROM api_keys ORDER BY created_at DESC`);
}

export async function revokeApiKey(id: number): Promise<void> {
  await query(`UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`, [id]);
}

type AuthResult =
  | { ok: true; key: ApiKey }
  | { ok: false; response: NextResponse };

function deny(status: number, error: string): AuthResult {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

export async function authenticateApiKey(
  request: Request,
  required: "read" | "write"
): Promise<AuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) return deny(401, "Missing API key. Send 'Authorization: Bearer <key>'.");

  const record = await queryOne<ApiKey>(
    `UPDATE api_keys
     SET last_used_at = now(), request_count = request_count + 1
     WHERE key_hash = $1 AND revoked_at IS NULL
     RETURNING ${PUBLIC_COLUMNS}`,
    [hashKey(match[1])]
  );
  if (!record) return deny(401, "Invalid or revoked API key.");

  if (required === "write" && record.scope !== "read_write") {
    return deny(403, "This API key is read-only.");
  }
  return { ok: true, key: record };
}
