"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { UserSettings } from "@/generated/prisma";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import StatsCard from "./StatsCard";

function OverView({ userSettings }: { userSettings: UserSettings }) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  return (
    <div className="flex pt-5 flex-col items-center gap-4 w-[85%] max-w-7xl mx-auto px-4">
      <div className="flex flex-wrap items-center justify-between w-full gap-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
          Overview
        </h2>
        <div className="flex items-center gap-2">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;
              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `Date range cannot be more than ${MAX_DATE_RANGE_DAYS} days`
                );
                return;
              }
              setDateRange({ from, to });
            }}
          />
        </div>
      </div>
      <StatsCard
        userSettings={userSettings}
        from={dateRange.from}
        to={dateRange.to}
      />
    </div>
  );
}

export default OverView;
