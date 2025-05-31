import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  loading,
  children,
  skeleton,
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {skeleton || <DefaultSkeleton />}
      </div>
    );
  }

  return <>{children}</>;
};

const DefaultSkeleton = () => (
  <Card className="bg-slate-800/50 border-slate-700/50">
    <CardHeader>
      <Skeleton className="h-6 w-48 bg-slate-700/50" />
      <Skeleton className="h-4 w-64 bg-slate-700/50" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full bg-slate-700/50" />
    </CardContent>
  </Card>
);

// Specific skeleton components for different use cases
export const ChartSkeleton = () => (
  <Card className="bg-slate-800/50 border-slate-700/50">
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-slate-700/50" />
          <Skeleton className="h-4 w-64 bg-slate-700/50" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 bg-slate-700/50" />
          <Skeleton className="h-6 w-24 bg-slate-700/50" />
        </div>
      </div>

      {/* Chart tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 bg-slate-700/50" />
          ))}
        </div>
        <Skeleton className="h-80 w-full bg-slate-700/50" />
      </div>
    </div>
  </Card>
);

export const PerformanceCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16 bg-slate-700/50" />
              <Skeleton className="h-6 w-12 bg-slate-700/50" />
            </div>
            <Skeleton className="h-8 w-20 bg-slate-700/50" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 bg-slate-700/50" />
              <Skeleton className="h-3 w-8 bg-slate-700/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const QuickActionsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-xl bg-slate-700/50" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-16 bg-slate-700/50" />
                <Skeleton className="h-3 w-12 bg-slate-700/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24 bg-slate-700/50" />
              <Skeleton className="h-4 w-32 bg-slate-700/50" />
            </div>
            <Skeleton className="h-9 w-full bg-slate-700/50" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
