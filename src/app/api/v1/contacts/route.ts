import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { createContact, listContacts } from "@/lib/contacts";
import type { ContactStatus } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "read");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const result = await listContacts({
    status: (searchParams.get("status") as ContactStatus | null) ?? undefined,
    intent: searchParams.get("intent") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    limit: Math.min(Number(searchParams.get("limit")) || 50, 200),
    offset: Number(searchParams.get("offset")) || 0,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request, "write");
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const name = str(body.name).trim();
  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 422 });
  }

  const contact = await createContact({
    source: "manual",
    name,
    email: str(body.email),
    phone: str(body.phone),
    company: str(body.company),
    website: str(body.website),
    notes: str(body.notes),
    intent: str(body.intent) || null,
  });
  return NextResponse.json(contact, { status: 201 });
}
