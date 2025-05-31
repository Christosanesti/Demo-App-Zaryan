"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Users,
  Package,
  FileText,
  Building2,
  BookOpen,
  Plus,
  ArrowRight,
  Zap,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { EnhancedCard } from "@/components/ui/design-system";
import { ChartSkeleton } from "@/components/ui/skeleton-wrapper";
import DashboardCharts from "./DashboardCharts";
import Link from "next/link";

export default function QuickActions() {
  const route = useRouter();

  const actions = [
    {
      title: "New Sale",
      description: "Record a new sale transaction",
      icon: ShoppingCart,
      href: "/sales",
      color: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-400",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
      badge: "Revenue",
      stats: "+12%",
    },
    {
      title: "Add Customer",
      description: "Register a new customer",
      icon: Users,
      href: "/customers",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-400",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
      badge: "Growth",
      stats: "+8%",
    },
    {
      title: "Add Inventory",
      description: "Manage your product inventory",
      icon: Package,
      href: "/inventory",
      color: "from-purple-500 to-pink-600",
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/10 to-pink-600/10",
      badge: "Stock",
      stats: "145 items",
    },
    {
      title: "New Invoice",
      description: "Create and send invoices",
      icon: FileText,
      href: "/invoices",
      color: "from-orange-500 to-red-600",
      iconColor: "text-orange-400",
      bgGradient: "from-orange-500/10 to-red-600/10",
      badge: "Billing",
      stats: "23 pending",
    },
    {
      title: "Ledgers",
      description: "Manage financial ledgers and accounts",
      icon: Database,
      href: "/ledgers",
      color: "from-cyan-500 to-blue-600",
      iconColor: "text-cyan-400",
      bgGradient: "from-cyan-500/10 to-blue-600/10",
      badge: "Finance",
      stats: "Multi-Type",
    },
    {
      title: "Daily Book",
      description: "View daily transactions",
      icon: BookOpen,
      href: "/daybook",
      color: "from-indigo-500 to-purple-600",
      iconColor: "text-indigo-400",
      bgGradient: "from-indigo-500/10 to-purple-600/10",
      badge: "Analytics",
      stats: "Today",
    },
  ];

  const handleNavigation = (href: string, title: string) => {
    const route = useRouter();
  };

  return (
    <div className="space-y-8">
      <EnhancedCard
        title="Quick Actions"
        description="Frequently used operations for efficient workflow"
        icon={Zap}
        iconColor="text-yellow-400"
        gradientFrom="from-yellow-500/5"
        gradientTo="to-orange-500/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link href={action.href} key={action.title}>
                <div className="group hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
                  <Card
                    className={`relative overflow-hidden bg-gradient-to-br ${action.bgGradient} border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                  >
                    {/* Background Decoration */}
                    <div className="absolute inset-0 opacity-30">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.color}`}
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
                    </div>

                    {/* Content */}
                    <CardContent className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`h-6 w-6 text-white`} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={`border-slate-600/30 ${action.iconColor} bg-slate-800/50 backdrop-blur-sm`}
                          >
                            {action.badge}
                          </Badge>
                          <span className="text-xs text-slate-400 font-medium">
                            {action.stats}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                          {action.description}
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          handleNavigation(action.href, action.title)
                        }
                        variant="ghost"
                        className="w-full mt-4 justify-between hover:bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                      >
                        <span className="text-slate-300 group-hover:text-slate-200">
                          Get Started
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-1 transition-all duration-300" />
                      </Button>
                    </CardContent>

                    {/* Hover Glow Effect */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${action.color} blur-xl`}
                    />
                  </Card>
                </div>
              </Link>
            );
          })}
        </div>
      </EnhancedCard>

      {/* Dashboard Charts Component with Suspense boundary */}
      <Suspense fallback={<ChartSkeleton />}>
        <DashboardCharts />
      </Suspense>
    </div>
  );
}
