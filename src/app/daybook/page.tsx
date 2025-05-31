import { DaybookTable } from "@/components/daybook/DaybookTable";
import { DaybookDialog } from "@/components/daybook/DaybookDialog";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DaybookPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daybook</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        <DaybookDialog />
      </div>
      <div className="rounded-lg border bg-card">
        <DaybookTable />
      </div>
    </div>
  );
}
