import DaybookClient from "./_components/DaybookClient";

export const dynamic = "force-dynamic";

export default async function DaybookPage() {
  return (
    <div className="container mx-auto py-10">
      <DaybookClient />
    </div>
  );
}
