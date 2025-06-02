"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";
import {
  CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Pencil,
  Trash,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User } from "@/generated/prisma";
import { DaybookForm } from "@/components/daybook/daybook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountUp from "react-countup";

const formSchema = z.object({
  date: z.date(),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).optional(),
  attachments: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DaybookClientProps {}

export default function DaybookClient({}: DaybookClientProps) {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    status: "",
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      date: new Date(),
      amount: 0,
      type: "income",
      description: "",
      reference: "",
      category: "uncategorized",
      paymentMethod: "cash",
      status: "completed",
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["daybook-entries", selectedDate],
    queryFn: async () => {
      const response = await fetch("/api/daybook");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch entries");
      }
      const data = await response.json();

      // Calculate totals
      const entries = data.entries || [];
      const totals = {
        income: entries
          .filter((entry: any) => entry.type === "income")
          .reduce((sum: number, entry: any) => sum + entry.amount, 0),
        expense: entries
          .filter((entry: any) => entry.type === "expense")
          .reduce((sum: number, entry: any) => sum + entry.amount, 0),
      };

      return {
        entries,
        totals,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/daybook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook-entries"] });
      form.reset();
      toast.success("Entry created successfully", {
        description: "Your daybook entry has been added.",
      });
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create entry", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/daybook/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook-entries"] });
      toast.success("Entry deleted successfully", {
        description: "The entry has been removed from your daybook.",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete entry", {
        description:
          error.message ||
          "There was an error deleting the entry. Please try again.",
      });
    },
  });

  const handleDateChange = (days: number) => {
    setSelectedDate((prev) => addDays(prev ?? new Date(), days));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleLedgerClick = (reference: string) => {
    router.push(`/ledgers/${reference}`);
  };

  const handleEditEntry = (entry: any) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon");
  };

  const filteredEntries =
    Array.isArray(data?.entries) ?
      data.entries.filter((entry: any) => {
        const matchesSearch =
          entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.reference.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate =
          selectedDate ?
            format(new Date(entry.date), "yyyy-MM-dd") ===
            format(selectedDate, "yyyy-MM-dd")
          : true;
        return matchesSearch && matchesDate;
      })
    : [];

  const totalIncome = filteredEntries
    .filter((entry: any) => entry.type === "income")
    .reduce((sum: number, entry: any) => sum + entry.amount, 0);

  const totalExpenses = filteredEntries
    .filter((entry: any) => entry.type === "expense")
    .reduce((sum: number, entry: any) => sum + entry.amount, 0);

  const cashInHand = totalIncome - totalExpenses;

  // Group entries by date for better organization
  const groupedEntries = filteredEntries.reduce((groups: any, entry: any) => {
    const date = format(new Date(entry.date), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-400">Error loading entries</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["daybook-entries"] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Enhanced Header */}
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
                  Daybook
                </motion.h1>
                <motion.p
                  className="text-slate-400 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Track your daily financial transactions
                </motion.p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-400"
                  >
                    {filteredEntries.length} Entries
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400"
                  >
                    Active
                  </Badge>
                </div>
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="mr-2 h-4 w-4" />
                      New Entry
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] bg-slate-900/95 border-slate-700/50 backdrop-blur-lg overflow-hidden">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="text-slate-200 text-xl">
                      Create New Entry
                    </SheetTitle>
                    <SheetDescription className="text-slate-400">
                      Add a new financial transaction
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                    <DaybookForm
                      onSubmit={createMutation.mutate}
                      isSubmitting={createMutation.isPending}
                      onCancel={() => setIsSheetOpen(false)}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Total Income</CardTitle>
              <CardDescription className="text-slate-400">
                Today's income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                <CountUp
                  end={totalIncome}
                  decimals={2}
                  prefix="$"
                  duration={1.5}
                  separator=","
                />
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Total Expenses</CardTitle>
              <CardDescription className="text-slate-400">
                Today's expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-400">
                <CountUp
                  end={totalExpenses}
                  decimals={2}
                  prefix="$"
                  duration={1.5}
                  separator=","
                />
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Cash in Hand</CardTitle>
              <CardDescription className="text-slate-400">
                Current balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-2xl font-bold",
                  cashInHand >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                <CountUp
                  end={cashInHand}
                  decimals={2}
                  prefix="$"
                  duration={1.5}
                  separator=","
                />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/40 border-slate-700/50 text-slate-200"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal bg-slate-800/40 border-slate-700/50 text-slate-200",
                  !selectedDate && "text-slate-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ?
                  format(selectedDate, "PPP")
                : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-slate-800 border-slate-700"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="rounded-md border-slate-700"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Entries List */}
        <div className="space-y-8">
          <AnimatePresence>
            {isLoading ?
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="h-8 bg-slate-700/50 rounded w-48 animate-pulse" />
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card
                        key={i}
                        className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 animate-pulse"
                      >
                        <CardHeader>
                          <div className="h-6 bg-slate-700/50 rounded w-3/4" />
                          <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-4 bg-slate-700/50 rounded w-full" />
                            <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            : filteredEntries.length === 0 ?
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-lg mb-4">No entries found</p>
                <Button
                  onClick={() => setIsSheetOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Add first entry
                </Button>
              </div>
            : sortedDates.map((date) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-200">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 text-blue-400"
                      >
                        {groupedEntries[date].length} entries
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groupedEntries[date].map((entry: any) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                              <CardTitle className="text-slate-200">
                                {entry.description}
                              </CardTitle>
                              <CardDescription className="text-slate-400">
                                {format(new Date(entry.date), "h:mm a")}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-slate-800 border-slate-700"
                              >
                                <DropdownMenuItem
                                  className="text-slate-200 focus:bg-slate-700/50 focus:text-slate-200"
                                  onClick={() => {
                                    toast.info(
                                      "Edit functionality coming soon!"
                                    );
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {user?.publicMetadata?.role === "admin" && (
                                  <DropdownMenuItem
                                    className="text-red-400 focus:bg-slate-700/50 focus:text-red-400"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this entry?"
                                        )
                                      ) {
                                        deleteMutation.mutate(entry.id);
                                      }
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="default"
                                  className={cn(
                                    "text-sm",
                                    entry.type === "income" ?
                                      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                  )}
                                >
                                  {entry.type === "income" ?
                                    "Income"
                                  : "Expense"}
                                </Badge>
                                <p
                                  className={cn(
                                    "text-lg font-semibold",
                                    entry.type === "income" ?
                                      "text-emerald-400"
                                    : "text-red-400"
                                  )}
                                >
                                  <CountUp
                                    end={entry.amount}
                                    decimals={2}
                                    prefix="$"
                                    duration={1}
                                    separator=","
                                  />
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400">
                                    Reference:
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleLedgerClick(entry.reference)
                                    }
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    {entry.reference}
                                  </button>
                                </div>
                                {entry.category && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">
                                      Category:
                                    </span>
                                    <span className="text-slate-200">
                                      {entry.category}
                                    </span>
                                  </div>
                                )}
                                {entry.paymentMethod && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">
                                      Payment Method:
                                    </span>
                                    <span className="text-slate-200">
                                      {entry.paymentMethod}
                                    </span>
                                  </div>
                                )}
                                {entry.status && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">
                                      Status:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        entry.status === "completed" &&
                                          "border-emerald-500/30 text-emerald-400",
                                        entry.status === "pending" &&
                                          "border-yellow-500/30 text-yellow-400",
                                        entry.status === "cancelled" &&
                                          "border-red-500/30 text-red-400"
                                      )}
                                    >
                                      {entry.status}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {entry.notes && (
                                <div className="pt-2 border-t border-slate-700/50">
                                  <p className="text-sm text-slate-400">
                                    {entry.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            }
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
