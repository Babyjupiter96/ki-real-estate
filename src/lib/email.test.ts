import { describe, expect, it } from "vitest";
import { followUpReminderEmail, leadNotificationEmail } from "./email";
import type { Contact } from "./db";

const contact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 42,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  source: "lead_form",
  intent: "sell",
  status: "new",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-0100",
  company: "",
  website: "",
  notes: "",
  property_address: "",
  property_type: "",
  estimated_value: "",
  timeline: "",
  industry: "",
  seo_situation: "",
  budget: "",
  message: "",
  session_id: "",
  next_follow_up_at: null,
  last_contacted_at: null,
  last_reminder_sent_at: null,
  ...overrides,
});

describe("lead notification email", () => {
  it("uses the lead's name in the subject and links to the contact", () => {
    const { subject, html } = leadNotificationEmail(contact());
    expect(subject).toBe("New Ki lead: Jane Doe");
    expect(html).toContain("/admin/contacts/42");
  });

  it("HTML-escapes user-supplied fields so a lead cannot inject markup", () => {
    const { html } = leadNotificationEmail(
      contact({
        name: "<script>alert(1)</script>",
        message: '"><img src=x onerror=alert(1)>',
        property_address: "<b>bold</b>",
      })
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes optional details only when present", () => {
    const bare = leadNotificationEmail(contact()).html;
    expect(bare).not.toContain("Property");
    const detailed = leadNotificationEmail(contact({ property_address: "1 Main St" })).html;
    expect(detailed).toContain("1 Main St");
  });
});

describe("follow-up reminder email", () => {
  it("names the contact and links to their record", () => {
    const { subject, html } = followUpReminderEmail(contact());
    expect(subject).toBe("Follow-up due: Jane Doe");
    expect(html).toContain("/admin/contacts/42");
  });

  it("escapes the contact's name and email", () => {
    const { html } = followUpReminderEmail(contact({ name: "<i>x</i>", email: "<u>y</u>" }));
    expect(html).not.toContain("<i>x</i>");
    expect(html).not.toContain("<u>y</u>");
  });

  it("handles a contact with no email address", () => {
    expect(followUpReminderEmail(contact({ email: "" })).html).toContain("no email");
  });
});
