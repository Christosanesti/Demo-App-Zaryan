import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import CreateTansactionsDialogue from "./_components/CreateTansactionsDialogue";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  ArrowUp10Icon,
  ArrowUpIcon,
  ArrowUpNarrowWide,
  Plus,
} from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import OverView from "./_components/OverView";

async function page() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center, justify-between gap-6 py-8">
          <p className="text-3xl font-bold">Greetings, {user.firstName} 👋</p>
          <div className="flex items-center gap-x-2">
            <CreateTansactionsDialogue
              trigger={
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-green-500 px-4 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  New income{" "}
                  <ArrowBigUpDash className="h-5 w-5 animate-pulse text-green-500 " />
                </Button>
              }
              type="income"
            />
            <CreateTansactionsDialogue
              trigger={
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-red-500 px-4 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  New expense{" "}
                  <ArrowBigDownDash className="h-5 w-5 animate-pulse text-red-500" />
                </Button>
              }
              type="expense"
            />
          </div>
        </div>
      </div>
      <OverView userSettings={userSettings} />
    </div>
  );
}

export default page;
