import { NextResponse } from "next/server";
import { addNote, getContact, getNotes } from "@/lib/contacts";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const contactId = Number(id);

  if (!(await getContact(contactId))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: { body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Note body is required." }, { status: 422 });
  }

  await addNote(contactId, text);
  return NextResponse.json({ notes: await getNotes(contactId) }, { status: 201 });
}
