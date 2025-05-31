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
    <div className="block md:hidden border-separate backdrop-blur-sm border-b bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-slate-700/50">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
            <LogoMobile />
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden sm:block"
          >
            <p className="text-sm text-slate-400">
              Welcome back,{" "}
              <span className="text-white font-medium">
                {user?.firstName || "User"}
              </span>
            </p>
          </motion.div>
          <UserButton afterSignOutUrl="/sign-in" />
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
    <div className="hidden w-full border-separate border-b backdrop-blur-sm md:block bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-slate-700/50">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
            <Logo />
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-sm text-slate-400">
              Welcome back,{" "}
              <span className="text-white font-medium">
                {user?.firstName || "User"}
              </span>
            </p>
          </motion.div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
