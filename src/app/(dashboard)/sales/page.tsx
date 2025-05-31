import { getCurrentUserWithDB } from "@/lib/auth-utils";
import SalesClient from "./_components/SalesClient";

export default async function SalesPage() {
  const user = await getCurrentUserWithDB();

  if (!user || !user.settings) {
    return null;
  }

  return <SalesClient userSettings={user.settings} />;
}
