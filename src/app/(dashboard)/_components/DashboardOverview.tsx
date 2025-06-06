"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Database,
  Users,
  Package,
  UserCircle,
  TrendingUp,
  Calendar,
  Printer,
  Activity,
  CreditCard,
  Mail,
  Phone,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DashboardChart } from "./DashboardChart";
import QuickActions from "./QuickActions";

interface DashboardStats {
  totalDueAmount: number;
  totalProfit: number;
  paymentStats: {
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
  };
  duePayments: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
    dueDate: string;
    reference: string;
    originalAmount: number;
    daysUntilDue: number;
    isOverdue: boolean;
  }[];
}

export function DashboardOverview() {
  const { user } = useUser();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

  const handlePrintDuePayments = () => {
    if (!stats?.duePayments.length) {
      toast.error("No due payments to print");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative border-b border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="relative container flex flex-col items-center text-center gap-6 py-12">
          <motion.div
            className="welcome-header space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-slate-200 to-purple-400 bg-clip-text text-transparent">
              Welcome, {user?.firstName || "User"}!
            </h1>
            <p className="text-lg text-slate-400 font-medium">
              Welcome to Zaryan Corporation 👋
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
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

      {/* Quick Access Links */}
      <QuickActions />
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ?
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            : <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-slate-400">
                      Total Due Amount
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-red-400">
                        ${stats?.totalDueAmount.toLocaleString()}
                      </span>
                      {stats?.paymentStats?.overdue &&
                        stats.paymentStats.overdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {stats.paymentStats.overdue} Overdue
                          </Badge>
                        )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-slate-400">Total Profit</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-green-400">
                        ${stats?.totalProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-red-400">
                      {stats?.paymentStats.overdue}
                    </div>
                    <div className="text-sm text-slate-400">Overdue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-amber-400">
                      {stats?.paymentStats.dueToday}
                    </div>
                    <div className="text-sm text-slate-400">Due Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-400">
                      {stats?.paymentStats.dueThisWeek}
                    </div>
                    <div className="text-sm text-slate-400">Due This Week</div>
                  </div>
                </div>
              </div>
            }
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Due Payments
            </CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrintDuePayments}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print Due Payments</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ?
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            : <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {stats?.duePayments.map((payment) => (
                    <HoverCard key={payment.id}>
                      <HoverCardTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-200">
                                {payment.customerName}
                              </p>
                              {payment.isOverdue && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>
                                Due:{" "}
                                {isToday(new Date(payment.dueDate)) ?
                                  "Today"
                                : isTomorrow(new Date(payment.dueDate)) ?
                                  "Tomorrow"
                                : format(
                                    new Date(payment.dueDate),
                                    "MMM d, yyyy"
                                  )
                                }
                              </span>
                              <span>Ref: {payment.reference}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-red-400">
                                ${payment.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-400">
                                of ${payment.originalAmount.toLocaleString()}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          </div>
                        </motion.div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-slate-800 border-slate-700">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-200">
                              Customer Details
                            </h4>
                            <div className="space-y-1 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{payment.customerEmail}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{payment.customerPhone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-200">
                              Payment Details
                            </h4>
                            <div className="space-y-1 text-sm text-slate-400">
                              <div className="flex justify-between">
                                <span>Original Amount:</span>
                                <span>
                                  ${payment.originalAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Due Amount:</span>
                                <span>${payment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Days Until Due:</span>
                                <span>{payment.daysUntilDue} days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {!stats?.duePayments.length && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 mb-4">
                        <AlertCircle className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-400">No due payments</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            }
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <DashboardChart />
    </div>
  );
}
