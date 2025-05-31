import { getCurrentUserWithDB } from "@/lib/auth-utils";
import LedgersClient from "./_components/LedgersClient";

export default async function LedgersPage() {
  const user = await getCurrentUserWithDB();

  if (!user) {
    return null;
  }

  return <LedgersClient userSettings={user.settings} />;
}
