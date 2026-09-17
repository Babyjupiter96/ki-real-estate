import { query, logActivity, type Contact } from "./db";
import { sendMail, followUpReminderEmail, getNotifyEmail } from "./email";

// A follow-up is "due" once its date has passed, the contact isn't already
// won/lost, and either no reminder was ever sent for it or the follow-up
// date was pushed later than the last reminder (so re-scheduling triggers
// a fresh reminder instead of staying silent forever).
async function findDueFollowUps(): Promise<Contact[]> {
  return query<Contact>(
    `SELECT * FROM contacts
     WHERE next_follow_up_at IS NOT NULL
       AND next_follow_up_at <= now()
       AND status NOT IN ('won', 'lost')
       AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at < next_follow_up_at)`
  );
}

export async function runFollowUpScan(): Promise<{ checked: number; sent: number }> {
  const due = await findDueFollowUps();
  const notifyEmail = getNotifyEmail();
  let sent = 0;

  for (const contact of due) {
    if (notifyEmail) {
      const { subject, html } = followUpReminderEmail(contact);
      const result = await sendMail({ to: notifyEmail, subject, html });
      if (result.sent) sent += 1;
    }
    await query(`UPDATE contacts SET last_reminder_sent_at = now() WHERE id = $1`, [
      contact.id,
    ]);
    await logActivity(contact.id, "reminder_sent", { notifyEmail });
  }

  return { checked: due.length, sent };
}
