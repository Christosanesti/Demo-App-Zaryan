import { currentUser } from "@clerk/nextjs/server";
import { DashboardOverview } from "./_components/DashboardOverview";
import { PageContainer } from "@/components/ui/design-system";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <DashboardOverview />
    </PageContainer>
  );
}
