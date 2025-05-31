import { getCurrentUserWithDB } from "@/lib/auth-utils";
import InventoryClient from "./_components/InventoryClient";

export default async function InventoryPage() {
  const { userSettings } = await getCurrentUserWithDB();

  return <InventoryClient userSettings={userSettings} />;
}
