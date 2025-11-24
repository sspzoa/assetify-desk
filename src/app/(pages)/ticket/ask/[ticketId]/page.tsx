import { notFound } from "next/navigation";

import { AskTicketDetailView } from "@/components/ticket/TicketDetailView";
import { fetchAskTicketDetail } from "@/utils/notion/ask";

export default async function AskTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await props.params;
  if (!ticketId) {
    notFound();
  }

  try {
    const ticket = await fetchAskTicketDetail(ticketId);
    return <AskTicketDetailView ticketId={ticketId} detail={ticket} />;
  } catch (error) {
    console.error("Failed to load ticket", error);
    notFound();
  }
}
