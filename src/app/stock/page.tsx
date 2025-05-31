import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { StockTable } from "@/components/stock/StockTable";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <StockTable />
    </div>
  );
}
