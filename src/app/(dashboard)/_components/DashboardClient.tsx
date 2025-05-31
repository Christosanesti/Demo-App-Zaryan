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
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  UserPlus,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import OverView from "./OverView";
import History from "./History";
import QuickActions from "./QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomerClient from "../customers/_components/CustomerClient";
import StaffClient from "../staff/_components/StaffClient";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { toast } from "sonner";
import { User } from "@clerk/nextjs/server";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CURRENCY = "USD";

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/overview");
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setIsLoading(false),
    });

    // Enhanced animation sequence
    tl.from(".dashboard-header", {
      y: -50,
      opacity: 0,
      duration: 0.8,
    })
      .from(
        ".hero-stats",
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
        },
        "-=0.4"
      )
      .from(
        ".stat-card",
        {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        },
        "-=0.3"
      )
      .from(
        ".chart-section",
        {
          y: 40,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.2"
      )
      .from(
        ".activity-section",
        {
          x: -30,
          opacity: 0,
          duration: 0.5,
        },
        "-=0.3"
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

  const displayName =
    user.firstName ?
      `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "User";

  const statsData = [
    {
      title: "Total Revenue",
      value: dashboardData?.revenue?.current || "0.00",
      change: dashboardData?.revenue?.percentageChange || 0,
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      gradientFrom: "from-emerald-500/10",
      gradientTo: "to-green-500/10",
      trend: "up",
    },
    {
      title: "Total Sales",
      value: dashboardData?.sales?.current || "0",
      change: dashboardData?.sales?.percentageChange || 0,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
      gradientFrom: "from-blue-500/10",
      gradientTo: "to-cyan-500/10",
      trend: "up",
    },
    {
      title: "Total Customers",
      value: dashboardData?.customers?.current || "0",
      change: dashboardData?.customers?.percentageChange || 0,
      icon: Users,
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
      gradientFrom: "from-purple-500/10",
      gradientTo: "to-pink-500/10",
      trend: "up",
    },
    {
      title: "Inventory Items",
      value: dashboardData?.inventory?.current || "0",
      change: dashboardData?.inventory?.percentageChange || 0,
      icon: Package,
      color: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-400",
      gradientFrom: "from-orange-500/10",
      gradientTo: "to-amber-500/10",
      trend: "up",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "sale",
      title: "New sale completed",
      description: "Invoice #INV-001 - $1,250.00",
      time: "2 minutes ago",
      icon: ShoppingCart,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: 2,
      type: "customer",
      title: "New customer added",
      description: "John Doe - Premium customer",
      time: "15 minutes ago",
      icon: UserPlus,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      id: 3,
      type: "inventory",
      title: "Low stock alert",
      description: "Product ABC - Only 5 items left",
      time: "1 hour ago",
      icon: AlertCircle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      id: 4,
      type: "payment",
      title: "Payment received",
      description: "Invoice #INV-098 - $850.00",
      time: "2 hours ago",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Hero stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(147,51,234,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Header Section */}
        <div className="dashboard-header relative border-b border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
          <div className="relative container flex flex-wrap items-center justify-between gap-6 py-12">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-blue-500/20">
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-slate-200 to-purple-400 bg-clip-text text-transparent">
                    Welcome back, {user.firstName || "User"}!
                  </h1>
                  <p className="text-lg text-slate-400 font-medium">
                    Here's what's happening with your business today
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Systems Operational
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-500/30 text-purple-400"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Premium Account
                </Badge>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {/* Hero Statistics */}
          <div className="hero-stats grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  {/* Enhanced background pattern */}
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
                    <div className="text-3xl font-bold text-white mb-2 group-hover:text-slate-100 transition-colors">
                      {stat.title.includes("Revenue") ?
                        `$${stat.value}`
                      : stat.value}
                    </div>

                    <div className="flex items-center gap-2">
                      {stat.change > 0 ?
                        <div className="flex items-center text-emerald-400 text-sm">
                          <ArrowUpRight className="w-4 h-4" />
                          <span>+{stat.change}%</span>
                        </div>
                      : <div className="flex items-center text-red-400 text-sm">
                          <ArrowDownRight className="w-4 h-4" />
                          <span>{stat.change}%</span>
                        </div>
                      }
                      <span className="text-xs text-slate-400">
                        from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts and Analytics Section */}
          <div className="chart-section grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Revenue Overview
                    </CardTitle>
                    <p className="text-slate-400 text-sm">
                      Monthly revenue trends
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <OverView />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-400" />
                      Categories Breakdown
                    </CardTitle>
                    <p className="text-slate-400 text-sm">
                      Expense categories analysis
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <History />
              </CardContent>
            </Card>
          </div>

          {/* Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="activity-section lg:col-span-2">
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-400" />
                        Recent Activity
                      </CardTitle>
                      <p className="text-slate-400 text-sm">
                        Latest business transactions and updates
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      <AnimatePresence>
                        {recentActivities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                          >
                            <div
                              className={`p-2 rounded-lg ${activity.bgColor}`}
                            >
                              <activity.icon
                                className={`w-4 h-4 ${activity.color}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200">
                                {activity.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-500">
                                  {activity.time}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="quick-actions">
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    Essential business tools
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <QuickActions />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Goals and Targets */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                Monthly Goals & Progress
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Track your business objectives
              </p>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      Revenue Target
                    </span>
                    <span className="text-sm text-slate-400">
                      $15,000 / $20,000
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-slate-500">75% completed</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      New Customers
                    </span>
                    <span className="text-sm text-slate-400">23 / 30</span>
                  </div>
                  <Progress value={77} className="h-2" />
                  <p className="text-xs text-slate-500">77% completed</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      Sales Volume
                    </span>
                    <span className="text-sm text-slate-400">156 / 200</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-slate-500">78% completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
