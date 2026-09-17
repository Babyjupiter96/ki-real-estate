import { notFound } from "next/navigation";
import { getActivity, getContact, getNotes } from "@/lib/contacts";
import { ContactDetail } from "@/components/admin/ContactDetail";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(Number(id));
  if (!contact) notFound();

  const notes = await getNotes(contact.id);
  const activity = await getActivity(contact.id);

  return <ContactDetail contact={contact} initialNotes={notes} initialActivity={activity} />;
}
