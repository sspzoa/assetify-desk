import { notFound } from "next/navigation";

import AskTicketDetailView from "@/components/ticket/AskTicketDetail";
import { fetchAskTicketDetail } from "@/app/(api)/api/ticket/ask/notion-helpers";

export default async function AskTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await props.params;
  if (!ticketId) {
    notFound();
  }

  try {
    const ticket = await fetchAskTicketDetail(ticketId);
    return <AskTicketDetailView ticketId={ticketId} initialData={ticket} />;
  } catch (error) {
    console.error("Failed to load ticket", error);
    notFound();
  }
}
