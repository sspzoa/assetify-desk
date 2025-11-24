import { notFound } from "next/navigation";

import { RepairTicketDetailView } from "@/components/ticket/TicketDetailView";
import { fetchRepairTicketDetail } from "@/utils/notion/repair";

export default async function RepairTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await props.params;
  if (!ticketId) {
    notFound();
  }

  try {
    const ticket = await fetchRepairTicketDetail(ticketId);
    return <RepairTicketDetailView ticketId={ticketId} detail={ticket} />;
  } catch (error) {
    console.error("Failed to load repair ticket", error);
    notFound();
  }
}
