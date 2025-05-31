"use client";
import React from "react";
import Logo, { LogoMobile } from "@/components/logo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { Bell, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";

function Navbar() {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
}

function MobileNavbar() {
  const containerRef = useRef(null);
  const { user } = useUser();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".mobile-nav-content", {
      y: -20,
      opacity: 0,
      duration: 0.5,
    });
  }, []);

  return (
    <div className="block md:hidden border-separate backdrop-blur-lg border-b bg-slate-900/95 border-slate-700/50 shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />

      <nav className="relative container flex items-center justify-between px-6 py-3">
        <div className="flex h-[70px] min-h-[60px] items-center gap-x-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full scale-150" />
            <div className="relative">
              <LogoMobile />
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden sm:flex flex-col items-end"
          >
            <p className="text-xs text-slate-400 leading-tight">Welcome back</p>
            <p className="text-sm font-semibold text-white">
              {user?.firstName || "User"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-slate-800/50"
            >
              <Bell className="h-4 w-4 text-slate-400" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-2 w-2 p-0 text-xs"
              >
                <span className="sr-only">Notifications</span>
              </Badge>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative"
          >
            <div className="ring-1 ring-blue-500/30 ring-offset-1 ring-offset-slate-900 rounded-full flex">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </nav>
    </div>
  );
}

function DesktopNavbar() {
  const containerRef = useRef(null);
  const { user } = useUser();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".desktop-nav-content", {
      y: -20,
      opacity: 0,
      duration: 0.5,
    });
  }, []);

  return (
    <div className="hidden w-full border-separate border-b backdrop-blur-lg md:block bg-slate-900/95 border-slate-700/50 shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />

      <nav className="relative container flex items-center justify-between px-8 py-3">
        <div className="flex h-[70px] min-h-[60px] items-center gap-x-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full scale-150" />
            <div className="relative">
              <Logo />
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-end"
          >
            <p className="text-xs text-slate-400 leading-tight">Welcome back</p>
            <p className="text-sm font-semibold text-white">
              {user?.firstName || "User"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild></DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800 border-slate-700"
              ></DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative"
          >
            <div className="ring-2 ring-blue-500/30 ring-offset-2 ring-offset-slate-900 rounded-full transition-all duration-300 hover:ring-blue-500/50">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
