"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Plus,
  Database,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageContainer,
  PageHeader,
  EnhancedCard,
  StatCard,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui/design-system";
import { LedgerEntryForm } from "./LedgerEntryForm";

interface LedgersClientProps {
  userSettings: any;
}

interface LedgerStats {
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
  recentCredits: number;
  recentDebits: number;
  recentTransactions: number;
  byType: Record<string, any>;
  lastUpdated: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  customType?: string;
  title: string;
  description?: string;
  amount: number;
  transactionType: "CREDIT" | "DEBIT";
  date: string;
  reference?: string;
  category?: string;
  paymentMethod?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const LEDGER_TYPES = [
  {
    id: "ALL",
    name: "All Ledgers",
    description: "View all ledger entries",
    icon: Database,
    color: "from-slate-500 to-slate-600",
    bgGradient: "from-slate-500/10 to-slate-600/10",
  },
  {
    id: "BANK",
    name: "Bank Ledger",
    description: "Banking transactions and operations",
    icon: Database,
    color: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-600/10",
  },
  {
    id: "EXPENSE",
    name: "Expense Ledger",
    description: "Business expenses and costs",
    icon: TrendingDown,
    color: "from-red-500 to-orange-600",
    bgGradient: "from-red-500/10 to-orange-600/10",
  },
  {
    id: "SALARY",
    name: "Salary Ledger",
    description: "Employee salary and payroll",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bgGradient: "from-green-500/10 to-emerald-600/10",
  },
  {
    id: "PURCHASE",
    name: "Purchase Ledger",
    description: "Inventory and asset purchases",
    icon: Database,
    color: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-500/10 to-indigo-600/10",
  },
  {
    id: "SALE",
    name: "Sale Ledger",
    description: "Sales revenue and transactions",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
  },
  {
    id: "CUSTOMER",
    name: "Customer Ledger",
    description: "Customer accounts and payments",
    icon: Database,
    color: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
  },
  {
    id: "CUSTOM",
    name: "Custom Ledger",
    description: "User-defined ledger categories",
    icon: Database,
    color: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
  },
];

export default function LedgersClient({ userSettings }: LedgersClientProps) {
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch ledger entries
  const {
    data: entries = [],
    isLoading: entriesLoading,
    error: entriesError,
  } = useQuery({
    queryKey: ["ledger-entries", selectedType, searchTerm, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== "ALL") params.append("type", selectedType);
      if (searchTerm) params.append("search", searchTerm);
      if (filterType !== "ALL") params.append("filter", filterType);

      const response = await fetch(`/api/ledgers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  // Fetch ledger stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<LedgerStats>({
    queryKey: ["ledger-stats"],
    queryFn: async () => {
      const response = await fetch("/api/ledgers/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const handleCreateEntry = () => {
    setShowCreateDialog(true);
  };

  const filteredEntries = entries.filter((entry: LedgerEntry) => {
    const matchesSearch =
      !searchTerm ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "ALL" || entry.type === selectedType;
    const matchesFilter =
      filterType === "ALL" || entry.transactionType === filterType;

    return matchesSearch && matchesType && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTransactionColor = (type: string) => {
    return type === "CREDIT" ? "text-green-400" : "text-red-400";
  };

  const getTransactionIcon = (type: string) => {
    return type === "CREDIT" ? TrendingUp : TrendingDown;
  };

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Ledgers Management"
        description="Comprehensive financial ledger management system"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={handleCreateEntry}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </PageHeader>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats.totalBalance)}
            change={`${stats.totalTransactions} transactions`}
            icon={DollarSign}
            color="from-emerald-500 to-teal-600"
            gradientFrom="from-emerald-500/20"
            gradientTo="to-teal-600/20"
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Total Credits"
            value={formatCurrency(stats.totalCredits)}
            change={`Recent: ${formatCurrency(stats.recentCredits)}`}
            icon={TrendingUp}
            color="from-green-500 to-emerald-600"
            gradientFrom="from-green-500/20"
            gradientTo="to-emerald-600/20"
            iconColor="text-green-400"
          />
          <StatCard
            title="Total Debits"
            value={formatCurrency(stats.totalDebits)}
            change={`Recent: ${formatCurrency(stats.recentDebits)}`}
            icon={TrendingDown}
            color="from-red-500 to-orange-600"
            gradientFrom="from-red-500/20"
            gradientTo="to-orange-600/20"
            iconColor="text-red-400"
          />
          <StatCard
            title="Transactions"
            value={stats.totalTransactions.toString()}
            change={`Recent: ${stats.recentTransactions}`}
            icon={Activity}
            color="from-blue-500 to-cyan-600"
            gradientFrom="from-blue-500/20"
            gradientTo="to-cyan-600/20"
            iconColor="text-blue-400"
          />
        </div>
      )}

      {/* Ledger Type Selector */}
      <EnhancedCard
        title="Ledger Types"
        description="Select a ledger type to view and manage entries"
        icon={Database}
        className="mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {LEDGER_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={() => setSelectedType(type.id)}
              >
                <div
                  className={`
                    relative p-4 rounded-lg border transition-all duration-300
                    ${
                      isSelected ?
                        "border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-600/20"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`
                        p-2 rounded-lg
                        ${
                          isSelected ?
                            `bg-gradient-to-br ${type.color}`
                          : "bg-slate-700 group-hover:bg-slate-600"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span
                      className={`
                        text-sm font-medium
                        ${isSelected ? "text-blue-400" : "text-slate-300"}
                      `}
                    >
                      {type.name.replace(" Ledger", "")}
                    </span>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="selectedIndicator"
                      className="absolute inset-0 rounded-lg border-2 border-blue-500"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </EnhancedCard>

      {/* Filters and Search */}
      <EnhancedCard
        title="Entries Management"
        description={`Managing ${selectedType === "ALL" ? "all" : selectedType.toLowerCase()} ledger entries`}
        icon={Filter}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search entries by title, description, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-800 border-slate-600 text-slate-200">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="CREDIT">Credits Only</SelectItem>
              <SelectItem value="DEBIT">Debits Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries Table */}
        {entriesLoading ?
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-800" />
            ))}
          </div>
        : filteredEntries.length === 0 ?
          <EmptyState
            icon={Database}
            title="No entries found"
            description={
              searchTerm || filterType !== "ALL" ?
                "Try adjusting your search or filter criteria"
              : "Create your first ledger entry to get started"
            }
            action={{
              label: "Create Entry",
              onClick: handleCreateEntry,
            }}
          />
        : <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Reference</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredEntries.map((entry: LedgerEntry) => {
                    const TransactionIcon = getTransactionIcon(
                      entry.transactionType
                    );

                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-slate-700 hover:bg-slate-800/50"
                      >
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {format(new Date(entry.date), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-slate-200 font-medium">
                              {entry.title}
                            </div>
                            {entry.description && (
                              <div className="text-sm text-slate-400 truncate max-w-[200px]">
                                {entry.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                          >
                            {entry.customType || entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.category && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-700 text-slate-300"
                            >
                              {entry.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TransactionIcon
                              className={`h-4 w-4 ${getTransactionColor(entry.transactionType)}`}
                            />
                            <span
                              className={`font-medium ${getTransactionColor(entry.transactionType)}`}
                            >
                              {entry.transactionType === "DEBIT" ? "-" : "+"}
                              {formatCurrency(entry.amount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {entry.reference || "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-600"
                            >
                              <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Entry
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        }
      </EnhancedCard>

      {/* Create Entry Dialog */}
      <LedgerEntryForm
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        selectedType={selectedType !== "ALL" ? selectedType : undefined}
      />
    </PageContainer>
  );
}
