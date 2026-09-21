import {
  query,
  queryOne,
  logActivity,
  type Contact,
  type ContactStatus,
  type ContactNote,
  type ContactActivity,
} from "./db";

export type ContactInput = Partial<
  Omit<Contact, "id" | "created_at" | "updated_at">
>;

const WRITABLE_FIELDS = [
  "source",
  "intent",
  "status",
  "name",
  "email",
  "phone",
  "company",
  "website",
  "notes",
  "property_address",
  "property_type",
  "estimated_value",
  "timeline",
  "industry",
  "seo_situation",
  "budget",
  "message",
  "session_id",
  "next_follow_up_at",
  "last_contacted_at",
  "last_reminder_sent_at",
] as const;

export async function createContact(input: ContactInput): Promise<Contact> {
  const fields = WRITABLE_FIELDS.filter((f) => input[f] !== undefined);
  const columns = fields.join(", ");
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
  const values = fields.map((f) => input[f] as string | null);

  const row = await queryOne<Contact>(
    `INSERT INTO contacts (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  const contact = row!;
  await logActivity(contact.id, "contact_created", { source: contact.source });
  return contact;
}

export async function getContact(id: number): Promise<Contact | undefined> {
  return queryOne<Contact>(`SELECT * FROM contacts WHERE id = $1`, [id]);
}

export async function listContacts(filters: {
  status?: ContactStatus;
  intent?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ contacts: Contact[]; total: number }> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  if (filters.intent) {
    params.push(filters.intent);
    clauses.push(`intent = $${params.length}`);
  }
  if (filters.source) {
    params.push(filters.source);
    clauses.push(`source = $${params.length}`);
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    params.push(term);
    const p1 = params.length;
    clauses.push(
      `(name ILIKE $${p1} OR email ILIKE $${p1} OR company ILIKE $${p1} OR property_address ILIKE $${p1})`
    );
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM contacts ${where}`,
    params
  );

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const contacts = await query<Contact>(
    `SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    [...params, limit, offset]
  );

  return { contacts, total: totalRow?.count ?? 0 };
}

export async function updateContact(
  id: number,
  input: ContactInput
): Promise<Contact | undefined> {
  const fields = WRITABLE_FIELDS.filter((f) => input[f] !== undefined);
  if (fields.length === 0) return getContact(id);

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => input[f] as string | null);
  const idIdx = fields.length + 1;

  const contact = await queryOne<Contact>(
    `UPDATE contacts SET ${setClause}, updated_at = now() WHERE id = $${idIdx} RETURNING *`,
    [...values, id]
  );
  if (contact) {
    await logActivity(id, "contact_updated", { fields });
  }
  return contact;
}

export async function deleteContact(id: number): Promise<void> {
  await query(`DELETE FROM contacts WHERE id = $1`, [id]);
}

export async function addNote(contactId: number, body: string): Promise<void> {
  await query(`INSERT INTO contact_notes (contact_id, body) VALUES ($1, $2)`, [
    contactId,
    body,
  ]);
  await logActivity(contactId, "note_added", {});
}

export async function getNotes(contactId: number): Promise<ContactNote[]> {
  return query<ContactNote>(
    `SELECT * FROM contact_notes WHERE contact_id = $1 ORDER BY created_at DESC`,
    [contactId]
  );
}

export async function getActivity(contactId: number): Promise<ContactActivity[]> {
  return query<ContactActivity>(
    `SELECT * FROM contact_activity WHERE contact_id = $1 ORDER BY created_at DESC`,
    [contactId]
  );
}

export async function dashboardStats() {
  const totals = await query<{ status: string; count: number }>(
    `SELECT status, COUNT(*)::int as count FROM contacts GROUP BY status`
  );

  const byIntent = await query<{ intent: string; count: number }>(
    `SELECT COALESCE(intent, 'unspecified') as intent, COUNT(*)::int as count FROM contacts GROUP BY intent`
  );

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const newThisWeekRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM contacts WHERE created_at >= $1`,
    [sevenDaysAgo]
  );

  const dueFollowUpsRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM contacts
     WHERE next_follow_up_at IS NOT NULL AND next_follow_up_at <= now() AND status NOT IN ('won','lost')`
  );

  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM contacts`
  );

  return {
    totals,
    byIntent,
    newThisWeek: newThisWeekRow?.count ?? 0,
    dueFollowUps: dueFollowUpsRow?.count ?? 0,
    total: totalRow?.count ?? 0,
  };
}
