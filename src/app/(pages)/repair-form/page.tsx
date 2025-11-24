import { RepairFormView } from "@/components/form/TicketFormView";
import { loadRepairSelectOptions } from "@/utils/notion/repair";

export default async function RepairFormPage() {
  try {
    const options = await loadRepairSelectOptions();
    return <RepairFormView initialOptions={options} />;
  } catch (error) {
    console.error("Failed to load repair form options", error);
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return <RepairFormView initialError={message} />;
  }
}
