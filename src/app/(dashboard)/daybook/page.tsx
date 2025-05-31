import { getCurrentUserWithDB } from "@/lib/auth-utils";
import DaybookClient from "./_components/DaybookClient";

export default async function DaybookPage() {
  const user = await getCurrentUserWithDB();

  if (!user) {
    return null;
  }

  return <DaybookClient userSettings={user.settings} />;
}
