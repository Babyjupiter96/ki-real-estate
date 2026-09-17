import { NextResponse } from "next/server";
import { deleteContact, getContact, updateContact } from "@/lib/contacts";
import { getActivity, getNotes } from "@/lib/contacts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const contact = await getContact(Number(id));
  if (!contact) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({
    contact,
    notes: await getNotes(contact.id),
    activity: await getActivity(contact.id),
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const contact = await updateContact(Number(id), body);
  if (!contact) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(contact);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await deleteContact(Number(id));
  return NextResponse.json({ ok: true });
}
