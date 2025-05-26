"use client";
import { GetBalanceStatsResponse } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { UserSettings } from "@/generated/prisma";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Coins,
  CoinsIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";
import CountUp from "react-countup";
import CategoriesStats from "./CategoriesStats";

interface StatsCardProps {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

interface StatCardItemProps {
  formatter: Intl.NumberFormat;
  value: number;
  label: string;
  icon: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function StatCardItem({
  formatter,
  value,
  label,
  icon,
  className,
  style,
  children,
}: StatCardItemProps) {
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );

  return (
    <Card className={className} style={style}>
      <CardContent className="flex h-24 items-center gap-4 p-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-opacity-20 transition-all duration-300 hover:scale-110">
          {icon}
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {children || (
            <CountUp
              preserveValue
              redraw={false}
              end={value}
              decimals={2}
              formattingFn={formatFn}
              className="text-2xl font-bold"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCard({ from, to, userSettings }: StatsCardProps) {
  const statsQuery = useQuery<GetBalanceStatsResponse>({
    queryKey: ["overview", "stats", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const balance = income - expense;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative flex flex-wrap gap-4 md:flex-nowrap w-full">
        <SkeletonWrapper isLoading={statsQuery.isFetching}>
          <StatCardItem
            formatter={formatter}
            value={income}
            label="Income"
            icon={
              <div className="p-2 rounded-full bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            }
            className="w-full rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-sm transition-all hover:shadow-md dark:from-emerald-900/20 dark:to-emerald-800/20 md:w-1/3"
            style={{
              borderLeft: "4px solid rgb(34 197 94)",
              animation: "fadeIn 0.5s ease-in-out",
            }}
          />
        </SkeletonWrapper>

        <SkeletonWrapper isLoading={statsQuery.isFetching}>
          <StatCardItem
            formatter={formatter}
            value={expense}
            label="Expense"
            icon={
              <div className="p-2 rounded-full bg-red-500/20">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            }
            className="w-full rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 p-6 shadow-sm transition-all hover:shadow-md dark:from-red-900/20 dark:to-red-800/20 md:w-1/3"
            style={{
              borderLeft: "4px solid rgb(239 68 68)",
              animation: "fadeIn 0.5s ease-in-out",
            }}
          />
        </SkeletonWrapper>

        <SkeletonWrapper isLoading={statsQuery.isFetching}>
          <StatCardItem
            formatter={formatter}
            value={balance}
            label="Balance"
            icon={
              <div className="p-2 rounded-full bg-blue-500/20">
                <CoinsIcon className="h-6 w-6 text-blue-500" />
              </div>
            }
            className="w-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm transition-all hover:shadow-md dark:from-blue-900/20 dark:to-blue-800/20 md:w-1/3"
            style={{
              borderLeft: `4px solid rgb(59 130 246)`,
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            <CountUp
              preserveValue
              redraw={false}
              end={balance}
              decimals={2}
              formattingFn={(num: number) => formatter.format(num)}
              className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}
            />
          </StatCardItem>
        </SkeletonWrapper>
      </div>

      <div className="w-full">
        <CategoriesStats userSettings={userSettings} from={from} to={to} />
      </div>
    </div>
  );
}

export default StatsCard;
