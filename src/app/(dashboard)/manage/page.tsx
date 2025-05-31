"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon } from "lucide-react";
import { ArrowDownIcon } from "lucide-react";
import React from "react";

function page() {
  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-5">
          <div className="">
            <p className="text-3cl font-bold">Manage</p>
            <p className="text-muted-foreground">
              Manage your account settings and categories
            </p>
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-4 p-4">
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
}

export default page;

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isFetching}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "income" ?
                <ArrowUpIcon className="h-4 w-4 text-emerald-500 transition-transform hover:scale-110 hover:-translate-y-0.5 duration-300 ease-in-out" />
              : <ArrowDownIcon className="h-4 w-4 text-red-500 transition-transform hover:scale-110 hover:translate-y-0.5 duration-300 ease-in-out" />
              }
              {type === "income" ?
                <span className="font-medium text-emerald-500 transition-colors duration-300">
                  Income
                </span>
              : <span className="font-medium text-red-500 transition-colors duration-300">
                  Expense
                </span>
              }
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
    </SkeletonWrapper>
  );
}
