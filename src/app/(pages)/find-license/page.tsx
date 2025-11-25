import { FindLicenseFormView } from "@/components/form/TicketFormView";
import { loadFindLicenseSelectOptions } from "@/utils/notion/find-license";

export default async function FindLicensePage() {
  try {
    const options = await loadFindLicenseSelectOptions();
    return <FindLicenseFormView initialOptions={options} />;
  } catch (error) {
    console.error("Failed to load find-license form options", error);
    const message =
      error instanceof Error ? error.message : "Failed to load options";
    return <FindLicenseFormView initialError={message} />;
  }
}
