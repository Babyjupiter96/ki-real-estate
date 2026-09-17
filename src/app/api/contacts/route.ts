import { NextResponse } from "next/server";
import { createContact, listContacts } from "@/lib/contacts";
import type { ContactStatus } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ContactStatus | null;
  const intent = searchParams.get("intent");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;

  const result = await listContacts({
    status: status ?? undefined,
    intent: intent ?? undefined,
    source: source ?? undefined,
    search: search ?? undefined,
    limit,
    offset,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 422 });
  }

  const contact = await createContact({
    source: "manual",
    name,
    email: str(body.email),
    phone: str(body.phone),
    company: str(body.company),
    website: str(body.website),
    notes: str(body.notes),
    status: (str(body.status) as ContactStatus) || "new",
    intent: str(body.intent) || null,
    next_follow_up_at: str(body.next_follow_up_at) || null,
  });

  return NextResponse.json(contact, { status: 201 });
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
