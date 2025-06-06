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
  Activity,
  Zap,
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
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface ChartDataItem {
  date: string;
  sales?: number;
  customers?: number;
  value: number;
  name: string;
  color: string;
  percentage: number;
}

interface ApiResponse {
  data: ChartDataItem[];
}

interface DashboardChartsProps {
  className?: string;
}

// API fetch functions
const fetchOverviewData = async (): Promise<PerformanceData[]> => {
  const response = await fetch("/api/dashboard/overview");
  if (!response.ok) throw new Error("Failed to fetch overview data");
  const result = await response.json();
  if (!result.data) throw new Error("No data received from server");
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
  const data = await response.json();
  return (data as ApiResponse).data;
};

// Custom tooltip component for better data visualization
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-3 shadow-lg">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-slate-400">
              {label}
            </span>
            <span className="font-bold text-slate-200">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          {payload[1] && (
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-slate-400">
                Customers
              </span>
              <span className="font-bold text-slate-200">
                {payload[1].value.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Generate random data for demonstration
const generateRandomData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sales: Math.floor(Math.random() * 1000) + 500,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      customers: Math.floor(Math.random() * 50) + 20,
    });
  }
  return data;
};

// Categories data with real-world business categories
const categoriesData = [
  { name: "Electronics", value: 35, color: "#3B82F6" },
  { name: "Clothing", value: 25, color: "#10B981" },
  { name: "Food & Beverage", value: 20, color: "#F59E0B" },
  { name: "Home Goods", value: 15, color: "#8B5CF6" },
  { name: "Others", value: 5, color: "#EC4899" },
];

export const DashboardCharts = () => {
  const [activeChart, setActiveChart] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [liveMode, setLiveMode] = useState(false);

  // Fetch overview data
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["dashboard-overview", timeRange],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - (timeRange === "7d" ? 7 : 30));
      const response = await fetch(
        `/api/dashboard/overview?from=${from.toISOString()}&to=${new Date().toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch overview data");
      const data = (await response.json()) as ApiResponse;
      // Ensure dates are properly formatted
      if (!data || !Array.isArray(data.data)) {
        return { data: [] };
      }
      return {
        ...data,
        data: data.data.map((item) => ({
          ...item,
          date: new Date(item.date).toISOString(),
        })),
      };
    },
    refetchInterval: liveMode ? 5000 : false,
  });

  // Fetch sales analytics data
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ["dashboard-sales", timeRange],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - (timeRange === "7d" ? 7 : 30));
      const response = await fetch(
        `/api/dashboard/sales-analytics?from=${from.toISOString()}&to=${new Date().toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = (await response.json()) as ApiResponse;
      // Ensure dates are properly formatted
      return {
        ...data,
        data: data.data.map((item) => ({
          ...item,
          date: new Date(item.date).toISOString(),
        })),
      };
    },
    refetchInterval: liveMode ? 5000 : false,
  });

  // Fetch category data
  const { data: categoryData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["dashboard-categories", timeRange],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - (timeRange === "7d" ? 7 : 30));
      const response = await fetch(
        `/api/dashboard/categories?from=${from.toISOString()}&to=${new Date().toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch category data");
      const data = await response.json();
      return data as ApiResponse;
    },
    refetchInterval: liveMode ? 5000 : false,
  });

  const isLoading = isLoadingOverview || isLoadingSales || isLoadingCategories;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7d")}
            className="bg-slate-800/50 hover:bg-slate-700/50"
          >
            7D
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30d")}
            className="bg-slate-800/50 hover:bg-slate-700/50"
          >
            30D
          </Button>
        </div>
        <Button
          variant={liveMode ? "default" : "outline"}
          size="sm"
          onClick={() => setLiveMode(!liveMode)}
          className={cn(
            "gap-2",
            liveMode ?
              "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
            : "bg-slate-800/50 hover:bg-slate-700/50"
          )}
        >
          <Zap className={cn("h-4 w-4", liveMode && "animate-pulse")} />
          {liveMode ? "Live" : "Static"}
        </Button>
      </div>

      <Tabs value={activeChart} onValueChange={setActiveChart}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger
            value="overview"
            className="gap-2 data-[state=active]:bg-slate-700/50"
          >
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="gap-2 data-[state=active]:bg-slate-700/50"
          >
            <BarChart3 className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="gap-2 data-[state=active]:bg-slate-700/50"
          >
            <PieChartIcon className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-200">
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ?
                <div className="h-[400px] animate-pulse bg-slate-800/50 rounded-lg" />
              : <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={overviewData?.data || []}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorCustomers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      tickFormatter={(value) => {
                        try {
                          return format(new Date(value), "MMM d");
                        } catch (error) {
                          return value;
                        }
                      }}
                      tick={{ fill: "#6B7280" }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: "#6B7280" }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorCustomers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-200">
                Sales Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ?
                <div className="h-[400px] animate-pulse bg-slate-800/50 rounded-lg" />
              : <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      tickFormatter={(value) => {
                        try {
                          return format(new Date(value), "MMM d");
                        } catch (error) {
                          return value;
                        }
                      }}
                      tick={{ fill: "#6B7280" }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: "#6B7280" }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="sales"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-200">
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ?
                <div className="h-[400px] animate-pulse bg-slate-800/50 rounded-lg" />
              : <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={categoryData?.data || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(categoryData?.data || []).map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              className="hover:opacity-80 transition-opacity"
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-3 shadow-lg">
                                <p className="font-medium text-slate-200">
                                  {payload[0].name}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {payload[0].value?.toLocaleString() ?? 0} (
                                  {payload[0].payload?.percentage?.toFixed(1) ??
                                    0}
                                  %)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {(categoryData?.data || []).map(
                      (category: any, index: number) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-slate-200">
                              {category.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-200">
                              {category.value.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-400">
                              {category.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
