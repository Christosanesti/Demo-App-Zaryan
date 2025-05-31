import { getCurrentUserWithDB } from "@/lib/auth-utils";
import DaybookClient from "./_components/DaybookClient";

export default async function DaybookPage() {
  const { userSettings } = await getCurrentUserWithDB();

  return <DaybookClient userSettings={userSettings} />;
}
