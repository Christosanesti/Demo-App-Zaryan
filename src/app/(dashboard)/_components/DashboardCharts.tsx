"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  SkeletonWrapper,
  PerformanceCardsSkeleton,
  ChartSkeleton,
} from "@/components/ui/skeleton-wrapper";

interface PerformanceData {
  metric: string;
  current: number;
  target: number;
  percentage: number;
  growth: number;
  trend: string;
}

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  customers: number;
}

interface DailyStats {
  day: string;
  orders: number;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  count?: number;
}

interface DashboardChartsProps {
  className?: string;
}

// API fetch functions
const fetchOverviewData = async (): Promise<PerformanceData[]> => {
  const response = await fetch("/api/dashboard/overview");
  if (!response.ok) throw new Error("Failed to fetch overview data");
  const result = await response.json();
  return result.data;
};

const fetchSalesAnalytics = async (
  period: string = "6months"
): Promise<SalesData[]> => {
  const response = await fetch(
    `/api/dashboard/sales-analytics?period=${period}`
  );
  if (!response.ok) throw new Error("Failed to fetch sales analytics");
  const result = await response.json();
  return result.data;
};

const fetchDailyStats = async (): Promise<DailyStats[]> => {
  const response = await fetch("/api/dashboard/daily-stats");
  if (!response.ok) throw new Error("Failed to fetch daily stats");
  const result = await response.json();
  return result.data;
};

const fetchCategoryData = async (
  type: string = "inventory"
): Promise<CategoryData[]> => {
  const response = await fetch(`/api/dashboard/categories?type=${type}`);
  if (!response.ok) throw new Error("Failed to fetch category data");
  const result = await response.json();
  return result.data;
};

export default function DashboardCharts({ className }: DashboardChartsProps) {
  const [activeChart, setActiveChart] = useState("overview");
  const [salesPeriod, setSalesPeriod] = useState("6months");
  const [categoryType, setCategoryType] = useState("inventory");

  // React Query hooks for data fetching
  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance,
  } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchOverviewData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useQuery({
    queryKey: ["sales-analytics", salesPeriod],
    queryFn: () => fetchSalesAnalytics(salesPeriod),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: dailyStats,
    isLoading: dailyLoading,
    error: dailyError,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ["daily-stats"],
    queryFn: fetchDailyStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ["category-data", categoryType],
    queryFn: () => fetchCategoryData(categoryType),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Determine overall loading state
  const isAnyLoading =
    performanceLoading || salesLoading || dailyLoading || categoryLoading;
  const hasAnyError =
    performanceError || salesError || dailyError || categoryError;

  const handleRefreshAll = () => {
    Promise.all([
      refetchPerformance(),
      refetchSales(),
      refetchDaily(),
      refetchCategory(),
    ])
      .then(() => {
        toast.success("Dashboard data refreshed!");
      })
      .catch(() => {
        toast.error("Failed to refresh data");
      });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-200 font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Simple chart skeleton component
  const SimpleChartSkeleton = () => (
    <div className="h-80 w-full flex items-center justify-center">
      <div className="w-full h-full bg-slate-700/20 rounded-lg animate-pulse" />
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview Cards */}
      <SkeletonWrapper
        loading={performanceLoading}
        skeleton={<PerformanceCardsSkeleton />}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceError ?
            <div className="col-span-full text-center text-red-400">
              Failed to load performance data
            </div>
          : performanceData?.map((item, index) => (
              <Card
                key={item.metric}
                className="bg-slate-800/50 border-slate-700/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{item.metric}</p>
                      <p className="text-2xl font-bold text-slate-200">
                        {item.current.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          item.percentage >= 85 ? "default" : "secondary"
                        }
                        className={`${
                          item.percentage >= 85 ?
                            "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}
                      >
                        {item.percentage}%
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        of {item.target.toLocaleString()}
                      </p>
                      {item.growth !== 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.trend === "up" ?
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          : <TrendingDown className="w-3 h-3 text-red-400" />}
                          <span
                            className={`text-xs ${
                              item.trend === "up" ?
                                "text-emerald-400"
                              : "text-red-400"
                            }`}
                          >
                            {Math.abs(item.growth)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </SkeletonWrapper>

      {/* Charts Section */}
      <div>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Business Analytics
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Real-time view of your business performance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshAll}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Badge
                  variant="outline"
                  className="text-emerald-400 border-emerald-500/30"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs
              value={activeChart}
              onValueChange={setActiveChart}
              className="space-y-6"
            >
              <TabsList className="bg-slate-800 border-slate-600">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-slate-700"
                >
                  <AreaChartIcon className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-slate-700"
                >
                  <LineChartIcon className="w-4 h-4 mr-2" />
                  Sales Trend
                </TabsTrigger>
                <TabsTrigger
                  value="daily"
                  className="data-[state=active]:bg-slate-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Daily Stats
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="data-[state=active]:bg-slate-700"
                >
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {salesLoading ?
                  <SimpleChartSkeleton />
                : salesError || !salesData ?
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Failed to load sales data
                  </div>
                : <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient
                            id="salesGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="revenueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          fill="url(#salesGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          fill="url(#revenueGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                }
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                {salesLoading ?
                  <SimpleChartSkeleton />
                : salesError || !salesData ?
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Failed to load sales data
                  </div>
                : <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#3b82f6",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="customers"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#f59e0b",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                }
              </TabsContent>

              <TabsContent value="daily" className="space-y-4">
                {dailyLoading ?
                  <SimpleChartSkeleton />
                : dailyError || !dailyStats ?
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Failed to load daily statistics
                  </div>
                : <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="orders"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                          name="Orders"
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#06b6d4"
                          radius={[4, 4, 0, 0]}
                          name="Revenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                }
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant={
                      categoryType === "inventory" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCategoryType("inventory")}
                  >
                    Inventory
                  </Button>
                  <Button
                    variant={categoryType === "sales" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryType("sales")}
                  >
                    Sales
                  </Button>
                  <Button
                    variant={categoryType === "revenue" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryType("revenue")}
                  >
                    Revenue
                  </Button>
                </div>
                {categoryLoading ?
                  <SimpleChartSkeleton />
                : categoryError || !categoryData ?
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    Failed to load category data
                  </div>
                : <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) =>
                            `${name} ${percentage}%`
                          }
                          labelLine={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                }
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
