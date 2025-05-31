import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import CustomerClient from "./_components/CustomerClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch or create user settings
  let userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "USD",
      },
    });
  }

  return (
    <div className="container mx-auto py-10">
      <CustomerClient userSettings={userSettings} />
    </div>
  );
}
