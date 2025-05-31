import { getCurrentUserWithDB } from "@/lib/auth-utils";
import SalesClient from "./_components/SalesClient";

export default async function SalesPage() {
  const { userSettings } = await getCurrentUserWithDB();

  return <SalesClient userSettings={userSettings} />;
}
