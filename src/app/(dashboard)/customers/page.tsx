import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import CustomerClient from "./_components/CustomerClient";

const CustomersPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user settings for currency formatting
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    // Create default settings if none exist
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "USD",
      },
    });
  }

  return <CustomerClient userSettings={userSettings} />;
};

export default CustomersPage;
