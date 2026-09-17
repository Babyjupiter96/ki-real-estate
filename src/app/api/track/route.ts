import { NextResponse } from "next/server";
import { logPageEvent } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";

const ALLOWED_TYPES = new Set([
  "page_view",
  "cta_click",
  "form_start",
  "form_step",
  "form_submit",
]);

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request.headers.get("origin"));
  let body: {
    type?: string;
    path?: string;
    sessionId?: string;
    meta?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers }
    );
  }

  if (!body.type || !ALLOWED_TYPES.has(body.type)) {
    return NextResponse.json(
      { error: "Invalid event type." },
      { status: 422, headers }
    );
  }

  await logPageEvent(
    body.type,
    (body.path || "").slice(0, 500),
    (body.sessionId || "").slice(0, 100),
    body.meta ?? {}
  );

  return NextResponse.json({ ok: true }, { headers });
}
