"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Enhanced Page Header Component
interface PageHeaderProps {
  title: string;
  description: string;
  badges?: Array<{
    text: string;
    icon?: LucideIcon;
    variant?: "default" | "outline" | "secondary";
    color?: string;
  }>;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badges,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl" />
      <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-slate-400 text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
            {badges && badges.length > 0 && (
              <div className="flex items-center gap-2">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge
                      key={index}
                      variant={badge.variant || "outline"}
                      className={
                        badge.color || "border-blue-500/30 text-blue-400"
                      }
                    >
                      {Icon && <Icon className="w-3 h-3 mr-1" />}
                      {badge.text}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
          {children && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Card Component
interface EnhancedCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  children: React.ReactNode;
  className?: string;
}

export function EnhancedCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-400",
  gradientFrom = "from-blue-500/5",
  gradientTo = "to-purple-500/5",
  children,
  className,
}: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-slate-800/40 backdrop-blur-sm border-slate-700/50",
        className
      )}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} via-transparent ${gradientTo}`}
      />

      <CardHeader className="relative">
        <CardTitle className="text-slate-200 flex items-center gap-3 text-xl">
          {Icon && (
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-slate-400 text-base">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="relative">{children}</CardContent>
    </Card>
  );
}

// Enhanced Button Component
interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function EnhancedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading,
}: EnhancedButtonProps) {
  const baseClasses = "transition-all duration-300 font-medium";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl",
    outline: "border-slate-600/50 text-slate-400 hover:bg-slate-800/50 border",
    ghost: "hover:bg-slate-800/50 text-slate-400",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading ?
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      : children}
    </Button>
  );
}

// Loading States Component
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-blue-500/30 border-t-blue-500`}
        />
        <div
          className={`absolute inset-0 rounded-full bg-blue-500/10 animate-pulse`}
        />
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
        <Icon className="relative mx-auto h-16 w-16 text-slate-400 mb-6" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-3">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <EnhancedButton onClick={action.onClick}>{action.label}</EnhancedButton>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  gradientFrom,
  gradientTo,
  iconColor,
}: StatCardProps) {
  return (
    <motion.div
      className="group"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl`}
      >
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        </div>

        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-all duration-300 group-hover:scale-110">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold text-white mb-1 group-hover:text-slate-100 transition-colors">
            {value}
          </div>
          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
            {change}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Page Container Component
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen p-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
