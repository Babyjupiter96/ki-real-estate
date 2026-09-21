import { NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/api-keys";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await revokeApiKey(Number(id));
  return NextResponse.json({ ok: true });
}
