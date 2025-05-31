import { getCurrentUserWithDB } from "@/lib/auth-utils";
import InvoicesClient from "./_components/InvoicesClient";

export default async function InvoicesPage() {
  const userSettings = await getCurrentUserWithDB();

  return <InvoicesClient userSettings={userSettings} />;
}
