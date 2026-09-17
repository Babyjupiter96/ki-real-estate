import { NextResponse } from "next/server";
import type { LeadFormData } from "@/components/lead-form/types";
import { createContact } from "@/lib/contacts";
import { logActivity, logPageEvent } from "@/lib/db";
import { sendMail, leadNotificationEmail, getNotifyEmail } from "@/lib/email";
import { corsHeaders } from "@/lib/cors";

const DEFAULT_FOLLOW_UP_DAYS = 2;

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request.headers.get("origin"));
  let payload: Partial<LeadFormData> & { sessionId?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers }
    );
  }

  if (!payload.email || !payload.name) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 422, headers }
    );
  }

  const nextFollowUpAt = new Date(
    Date.now() + DEFAULT_FOLLOW_UP_DAYS * 86400000
  ).toISOString();

  const originSite = request.headers.get("origin") ?? "same-origin";

  const contact = await createContact({
    source: "lead_form",
    intent: payload.intent ?? null,
    status: "new",
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? "",
    company: payload.businessName ?? "",
    website: payload.website ?? "",
    property_address: payload.propertyAddress ?? "",
    property_type: payload.propertyType ?? "",
    estimated_value: payload.estimatedValue ?? "",
    timeline: payload.timeline ?? "",
    industry: payload.industry ?? "",
    seo_situation: payload.seoSituation ?? "",
    budget: payload.budget ?? "",
    message: payload.message ?? "",
    next_follow_up_at: nextFollowUpAt,
  });

  await logActivity(contact.id, "lead_submitted", { intent: contact.intent, originSite });
  await logPageEvent("form_submit", "/", payload.sessionId ?? "", {
    intent: contact.intent,
    contactId: contact.id,
    originSite,
  });

  const notifyEmail = getNotifyEmail();
  if (notifyEmail) {
    const { subject, html } = leadNotificationEmail(contact);
    await sendMail({ to: notifyEmail, subject, html });
  }

  return NextResponse.json({ ok: true, id: contact.id }, { headers });
}
