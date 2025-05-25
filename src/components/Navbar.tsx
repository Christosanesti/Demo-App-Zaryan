"use client";
import React, { useState } from "react";
import Logo, { LogoMobile } from "@/components/logo";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { UserButton } from "@clerk/nextjs";
import { ThemeSwitcherBtn } from "./ThemeSwtitcherBtn";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
function Navbar() {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
}

const items = [
  { label: "Dashboard", link: "/" },
  { label: "Transactions", link: "/transactions" },
  { label: "Manage", link: "/manage" },
];

function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="block md:hidden border-separate bg-background">
      <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[600px]" side="left">
            <Logo />
            <div className="flex flex-col gap-1 pt-4">
              {items.map((item) => (
                <NavbarItem
                  key={item.label}
                  label={item.label}
                  link={item.link}
                  clickCallback={() => setIsOpen((prev) => !prev)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <LogoMobile />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcherBtn />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </nav>
    </div>
  );
}

function DesktopNavbar() {
  return (
    <div className="hidden w-full border-separate border-b bg-background md:block">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] w-full items-center gap-x-8">
          <Logo />
          <div className="flex h-full flex-1 items-center justify-center space-x-8">
            {items.map((item) => (
              <NavbarItem
                key={item.label}
                link={item.link}
                label={item.label}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcherBtn />
          <div className="h-8 w-[1px] bg-border" />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </nav>
    </div>
  );
}

function NavbarItem({
  label,
  link,
  clickCallback,
}: {
  label: string;
  link: string;
  clickCallback?: () => void;
}) {
  const pathName = usePathname();
  const isActive = pathName === link;
  return (
    <div className="relative flex items-center">
      <Link
        href={link}
        onClick={() => {
          if (clickCallback) clickCallback();
        }}
        className={cn(
          buttonVariants({
            variant: "ghost",
          }),
          "relative px-6 py-2 text-base font-medium transition-colors duration-200",
          "hover:text-foreground/80",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {isActive && (
          <div className="absolute -bottom-[1.5px] left-0 h-[2px] w-full rounded-full bg-primary transition-all duration-200" />
        )}
      </Link>
    </div>
  );
}

export default Navbar;
