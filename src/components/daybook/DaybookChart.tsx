"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays, parseISO, startOfDay, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface DaybookEntry {
  id: string;
  date: string | Date;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
}

interface DaybookChartProps {
  entries: DaybookEntry[];
  isLoading: boolean;
  currency?: string;
}

const COLORS = {
  income: "#10b981", // emerald-500
  expense: "#ef4444", // red-500
  balance: "#3b82f6", // blue-500
};

const PIE_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#f97316",
];

export function DaybookChart({
  entries,
  isLoading,
  currency = "USD",
}: DaybookChartProps) {
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    // Group entries by date
    const groupedByDate = entries.reduce(
      (acc, entry) => {
        let dateStr: string;

        if (typeof entry.date === "string") {
          const parsedDate = parseISO(entry.date);
          dateStr =
            isValid(parsedDate) ?
              format(startOfDay(parsedDate), "yyyy-MM-dd")
            : entry.date.split("T")[0];
        } else if (entry.date instanceof Date) {
          dateStr = format(startOfDay(entry.date), "yyyy-MM-dd");
        } else {
          // Handle case where date might be a serialized date string
          const parsedDate = new Date(entry.date);
          dateStr =
            isValid(parsedDate) ?
              format(startOfDay(parsedDate), "yyyy-MM-dd")
            : format(startOfDay(new Date()), "yyyy-MM-dd");
        }

        if (!acc[dateStr]) {
          acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
        }

        if (entry.type === "income") {
          acc[dateStr].income += entry.amount;
        } else {
          acc[dateStr].expense += entry.amount;
        }

        return acc;
      },
      {} as Record<string, { date: string; income: number; expense: number }>
    );

    // Convert to array and calculate running balance
    let runningBalance = 0;
    return Object.values(groupedByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => {
        runningBalance += item.income - item.expense;
        return {
          ...item,
          balance: runningBalance,
          net: item.income - item.expense,
          displayDate: format(parseISO(item.date), "MMM dd"),
        };
      });
  }, [entries]);

  const categoryData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const grouped = entries.reduce(
      (acc, entry) => {
        const category = entry.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = { category, income: 0, expense: 0, total: 0 };
        }

        if (entry.type === "income") {
          acc[category].income += entry.amount;
        } else {
          acc[category].expense += entry.amount;
        }
        acc[category].total += entry.amount;

        return acc;
      },
      {} as Record<
        string,
        { category: string; income: number; expense: number; total: number }
      >
    );

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [entries]);

  const summaryStats = useMemo(() => {
    const totalIncome =
      entries
        ?.filter((e) => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalExpense =
      entries
        ?.filter((e) => e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0) || 0;
    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }, [entries]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(summaryStats.totalIncome)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Total Expense
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(summaryStats.totalExpense)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg bg-gradient-to-r border ${
                summaryStats.balance >= 0 ?
                  "from-blue-50 to-blue-100 border-blue-200"
                : "from-orange-50 to-orange-100 border-orange-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      summaryStats.balance >= 0 ?
                        "text-blue-600"
                      : "text-orange-600"
                    }`}
                  >
                    Net Balance
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      summaryStats.balance >= 0 ?
                        "text-blue-700"
                      : "text-orange-700"
                    }`}
                  >
                    {formatCurrency(summaryStats.balance)}
                  </p>
                </div>
                <DollarSign
                  className={`h-8 w-8 ${
                    summaryStats.balance >= 0 ?
                      "text-blue-500"
                    : "text-orange-500"
                  }`}
                />
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="trend" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
              <TabsTrigger value="daily">Daily Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="trend" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.income}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.income}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.expense}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.expense}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="displayDate"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "income" ? "Income"
                        : name === "expense" ? "Expense"
                        : "Balance",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke={COLORS.income}
                      fillOpacity={1}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke={COLORS.expense}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="displayDate"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "income" ? "Income" : "Expense",
                      ]}
                    />
                    <Bar
                      dataKey="income"
                      fill={COLORS.income}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      fill={COLORS.expense}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium mb-4">
                    Category Breakdown
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Total",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-80">
                  <h4 className="text-sm font-medium mb-4">Category Details</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="horizontal">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        type="number"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === "income" ? "Income" : "Expense",
                        ]}
                      />
                      <Bar dataKey="income" fill={COLORS.income} />
                      <Bar dataKey="expense" fill={COLORS.expense} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
