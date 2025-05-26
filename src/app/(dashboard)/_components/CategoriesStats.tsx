"use client";

import { GetCategoriesStatsResponse } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSettings } from "@/generated/prisma";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface CategoriesStatsProps {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

function CategoriesStats({ userSettings, from, to }: CategoriesStatsProps) {
  const statsQuery = useQuery<GetCategoriesStatsResponse>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);
  return (
    <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}

export default CategoriesStats;

function CategoriesCard({
  formatter,
  type,
  data,
}: {
  formatter: Intl.NumberFormat;
  type: TransactionType;
  data: GetCategoriesStatsResponse;
}) {
  const filteredData = data.filter((item) => item.type === type);

  const total = filteredData.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Card className="w-full md:w-1/2 h-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-muted-foreground">
          <span>{type === "income" ? "Income" : "Expense"} Categories</span>
          <span className="text-sm font-medium">{formatter.format(total)}</span>
        </CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new{" "}
              {type === "income" ? "income" : "expense"}
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <ScrollArea className="w-full h-60 px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item) => {
                const percentage = (item.amount * 100) / (total || item.amount);
                return (
                  <div className="flex flex-col gap-2" key={item.category}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            type === "income" ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatter.format(item.amount)}
                      </span>
                    </div>
                    <div
                      className={`h-2 w-full rounded-full ${
                        type === "income" ? "bg-emerald-100" : "bg-red-100"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          type === "income" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
