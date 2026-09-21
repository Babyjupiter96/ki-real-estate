import { NextResponse } from "next/server";
import { createApiKey, listApiKeys } from "@/lib/api-keys";

export async function GET() {
  return NextResponse.json({ keys: await listApiKeys() });
}

export async function POST(request: Request) {
  let body: { name?: string; scope?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "A key name is required." }, { status: 422 });
  }
  const scope = body.scope === "read_write" ? "read_write" : "read";

  const { key, record } = await createApiKey(name.slice(0, 80), scope);
  return NextResponse.json({ key, record }, { status: 201 });
}
