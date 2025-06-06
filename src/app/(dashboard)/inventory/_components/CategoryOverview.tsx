"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function CategoryOverview() {
  const [loading, setLoading] = useState(true);
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full max-w-md"
    >
      <Card className="bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <BarChart3 className="h-7 w-7 text-indigo-500" />
          <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            Category Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-pink-600 dark:text-pink-300">
                Total Categories
              </span>
              <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                --
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600 dark:text-green-300">
                Most Stocked
              </span>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                --
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-300">
                Least Stocked
              </span>
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                --
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
