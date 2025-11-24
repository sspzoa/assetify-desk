import { AskFormView } from "@/components/form/TicketFormView";
import { loadAskSelectOptions } from "@/utils/notion/ask";

export default async function AskFormPage() {
  try {
    const options = await loadAskSelectOptions();
    return <AskFormView initialOptions={options} />;
  } catch (error) {
    console.error("Failed to load ask form options", error);
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return <AskFormView initialError={message} />;
  }
}
