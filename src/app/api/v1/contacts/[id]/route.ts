import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { getContact } from "@/lib/contacts";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await authenticateApiKey(request, "read");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const contact = await getContact(Number(id));
  if (!contact) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(contact);
}
