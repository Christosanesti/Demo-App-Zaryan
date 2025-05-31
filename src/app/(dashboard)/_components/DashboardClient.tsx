"use client";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Building2,
  Calculator,
  FileText,
  Package,
  Users,
  Wallet,
  TrendingUp,
  Activity,
  CreditCard,
  Plus,
} from "lucide-react";
import OverView from "./OverView";
import History from "./History";
import QuickActions from "./QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import CustomerClient from "../customers/_components/CustomerClient";
import StaffClient from "../staff/_components/StaffClient";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";
import { toast } from "sonner";
import { User } from "@clerk/nextjs/server";

const DEFAULT_CURRENCY = "USD";

const statsData = [
  {
    title: "Total Due Amount",
    value: "0.00",
    change: "0 pending payments",
    icon: Wallet,
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
    gradientFrom: "from-blue-500/10",
    gradientTo: "to-cyan-500/10",
  },
  {
    title: "Total Sales",
    value: "0.00",
    change: "+0% from last month",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-400",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-green-500/10",
  },
  {
    title: "Total Inventory",
    value: "0.00",
    change: "0 items in stock",
    icon: Package,
    color: "from-orange-500/20 to-orange-600/20",
    iconColor: "text-orange-400",
    gradientFrom: "from-orange-500/10",
    gradientTo: "to-amber-500/10",
  },
  {
    title: "Total Customers",
    value: "0",
    change: "0 active customers",
    icon: Users,
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
    gradientFrom: "from-purple-500/10",
    gradientTo: "to-pink-500/10",
  },
];

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setIsLoading(false), // Set loading to false when animations complete
    });

    tl.from(".welcome-header", {
      y: -50,
      opacity: 0,
      duration: 0.8,
    })
      .from(
        ".stat-card",
        {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        },
        "-=0.4"
      )
      .from(
        ".quick-actions",
        {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
        },
        "-=0.2"
      );
  }, []);

  // Show loading state during initial animations
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-700/30 rounded animate-pulse" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6"
              >
                <div className="space-y-3">
                  <div className="h-6 w-16 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-700/30 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-4 w-64 bg-slate-700/30 rounded animate-pulse" />
              </div>
              <div className="h-96 w-full bg-slate-700/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    user.firstName ?
      `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "User";

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative border-b border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="relative container flex flex-wrap items-center justify-between gap-6 py-12">
          <motion.div
            className="welcome-header space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-slate-200 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-slate-400 font-medium">
              Welcome back, {displayName}! 👋
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge
                variant="outline"
                className="border-blue-500/30 text-blue-400"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="stat-card group"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`relative overflow-hidden bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
                </div>

                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-all duration-300 group-hover:scale-110`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-slate-100 transition-colors">
                    {stat.title.includes("Customers") ?
                      stat.value
                    : `${DEFAULT_CURRENCY} ${stat.value}`}
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Quick Actions Section */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50 hover:border-slate-600/30 transition-all duration-500 shadow-2xl">
            {/* Enhanced background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.1)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(147,51,234,0.1)_0%,_transparent_50%)]" />

            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-200 mb-2">
                    Quick Actions
                  </CardTitle>
                  <p className="text-slate-400">
                    Streamline your workflow with these essential tools
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">Ready</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <QuickActions />
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Recent Activity
              </CardTitle>
              <p className="text-slate-400">
                Stay updated with your latest transactions and activities
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-slate-400 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No recent activity
                </h3>
                <p className="text-slate-400 mb-6">
                  Your recent transactions and activities will appear here
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Your First Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
