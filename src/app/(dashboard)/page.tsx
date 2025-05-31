"use client";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {
  BookOpen,
  Building2,
  Calculator,
  FileText,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";
import OverView from "./_components/OverView";
import History from "./_components/History";
import Daybook from "./daybook/page";
import InventoryClient from "./inventory/_components/InventoryClient";
import QuickActions from "./_components/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import CustomerClient from "./customers/_components/CustomerClient";
import StaffClient from "./staff/_components/StaffClient";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { toast } from "sonner";

const DEFAULT_CURRENCY = "USD";

export default function DashboardPage() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".welcome-header", {
      y: -50,
      opacity: 0,
      duration: 0.8,
    })
      .from(".stat-card", {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      })
      .from(".quick-actions", {
        scale: 0.95,
        opacity: 0,
        duration: 0.5,
      });
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <motion.p
            className="welcome-header text-4xl font-bold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-white text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to Zaryan Corporation 👋
          </motion.p>
        </div>
      </div>

      <div className="container py-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    Total Due Amount
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {DEFAULT_CURRENCY} 0.00
                  </div>
                  <p className="text-xs text-slate-400">0 pending payments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    Total Sales
                  </CardTitle>
                  <Calculator className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {DEFAULT_CURRENCY} 0.00
                  </div>
                  <p className="text-xs text-slate-400">+0% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    Total Inventory
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {DEFAULT_CURRENCY} 0.00
                  </div>
                  <p className="text-xs text-slate-400">0 items in stock</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="stat-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-slate-400">0 active customers</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="quick-actions"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-300">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
