"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { EntryForm } from "./components/EntryForm";

// Types
type EntryType = "income" | "expense";
type Entry = {
  id: string;
  date: Date;
  type: EntryType;
  amount: number;
  description: string;
  reference: string;
  userId: string;
  userName: string;
};

export default function DaybookPage() {
  const { user } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");

  // Fetch entries
  const { data: fetchedEntries, isLoading } = useQuery<Entry[]>({
    queryKey: ["daybook-entries"],
    queryFn: async () => {
      const response = await fetch("/api/daybook");
      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }
      return response.json();
    },
  });

  // Filter entries
  const filteredEntries = fetchedEntries?.filter((entry) => {
    const matchesSearch = entry.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = type === "all" || entry.type === type;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalIncome = filteredEntries
    ?.filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpense = filteredEntries
    ?.filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = (totalIncome || 0) - (totalExpense || 0);

  const handleAddEntry = (entry: Omit<Entry, "id" | "userId" | "userName">) => {
    const newEntry: Entry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || "",
      userName: user?.firstName || "User",
    };
    setEntries([...entries, newEntry]);
    toast.success(
      `${entry.type === "income" ? "Income" : "Expense"} entry added successfully`
    );
    setIsAddingEntry(false);
  };

  const handleEditEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsEditing(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter((entry) => entry.id !== entryId));
    toast.success("Entry deleted successfully");
  };

  const handleUpdateEntry = (
    entry: Omit<Entry, "id" | "userId" | "userName">
  ) => {
    if (!selectedEntry) return;

    const updatedEntry: Entry = {
      ...entry,
      id: selectedEntry.id,
      userId: selectedEntry.userId,
      userName: selectedEntry.userName,
    };

    setEntries(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    toast.success("Entry updated successfully");
    setIsEditing(false);
    setSelectedEntry(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Daybook</h1>
        <p className="text-slate-400">
          Track your daily financial transactions
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              ${totalIncome?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              ${totalExpense?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Entry</DialogTitle>
            </DialogHeader>
            <EntryForm onSuccess={() => setIsAddingEntry(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Description</TableHead>
                <TableHead className="text-slate-400">Reference</TableHead>
                <TableHead className="text-right text-slate-400">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ?
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-700">
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredEntries?.length === 0 ?
                <TableRow className="border-slate-700">
                  <TableCell
                    colSpan={5}
                    className="text-center text-slate-400 py-8"
                  >
                    No entries found
                  </TableCell>
                </TableRow>
              : filteredEntries?.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <TableCell className="text-slate-300">
                      {format(entry.date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.type === "income" ?
                            "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {entry.reference}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.type === "income" ?
                          "text-green-400"
                        : "text-red-400"
                      }`}
                    >
                      ${entry.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
