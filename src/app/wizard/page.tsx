import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className="container flex max-w-2xl flex-col items-center justify-center gap-4">
      <h1 className="text-center text-3xl">
        Welcome <span className="font-bold ml-2">{user.firstName}! </span>
      </h1>
      <h2 className="mt-4 text-center text-base text-muted-foreground">
        Please set up your currency and category
      </h2>
      <Separator />
      <Card className="w-full">
        <CardHeader className="flex justify-center">
          <CardTitle>Currency:</CardTitle>
        </CardHeader>
        <CardDescription className="text-sm px-6 mb-5 text-center">
          Choose your currency
        </CardDescription>
        <Separator className="border mb-6 text-center flex w-[79%] mx-auto justify-center border-border" />
        <div className="px-6 mb-5 flex justify-center">
          <CurrencyComboBox />
        </div>
      </Card>
      <Separator />
      <Button className="w-full" asChild>
        <Link href={"/"}>All Set. . . Click Me!!!</Link>
      </Button>
      <div className=" mt-8">
        <Logo />
      </div>
    </div>
  );
}

export default page;
