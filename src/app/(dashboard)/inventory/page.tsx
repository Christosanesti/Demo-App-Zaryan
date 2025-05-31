import { getCurrentUserWithDB } from "@/lib/auth-utils";
import InventoryClient from "./_components/InventoryClient";

export default async function InventoryPage() {
  const user = await getCurrentUserWithDB();

  if (!user) {
    return null;
  }

  return <InventoryClient userSettings={user.settings} />;
}
