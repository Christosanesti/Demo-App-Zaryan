import { getCurrentUserWithDB } from "@/lib/auth-utils";
import LedgersClient from "./_components/LedgersClient";

export default async function LedgersPage() {
  const { userSettings } = await getCurrentUserWithDB();

  return <LedgersClient userSettings={userSettings} />;
}
