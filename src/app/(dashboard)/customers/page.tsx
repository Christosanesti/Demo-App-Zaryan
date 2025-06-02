import prisma from "@/lib/prisma";
import CustomerClient from "./_components/CustomerClient";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // First ensure the user exists in the database
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(),
    },
  });

  // Then fetch or create user settings
  let userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });
  }

  return (
    <div className="container mx-auto py-10">
      <CustomerClient />
    </div>
  );
}
