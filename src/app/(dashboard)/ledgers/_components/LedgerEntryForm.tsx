"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  DollarSign,
  FileText,
  Tag,
  Plus,
  X,
  CreditCard,
  Hash,
  Calendar as CalendarDays,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

const ledgerEntrySchema = z.object({
  type: z.enum([
    "BANK",
    "EXPENSE",
    "SALARY",
    "PURCHASE",
    "SALE",
    "CUSTOMER",
    "CUSTOM",
  ]),
  customType: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  transactionType: z.enum(["CREDIT", "DEBIT"]),
  date: z.date(),
  reference: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type LedgerEntryFormData = z.infer<typeof ledgerEntrySchema>;

interface LedgerEntryFormProps {
  open: boolean;
  onClose: () => void;
  selectedType?: string;
}

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Check",
  "UPI",
  "Digital Wallet",
  "Cryptocurrency",
];

const COMMON_CATEGORIES = {
  BANK: ["Interest", "Fees", "Transfer", "Maintenance"],
  EXPENSE: ["Office", "Travel", "Utilities", "Marketing", "Supplies"],
  SALARY: ["Basic", "Bonus", "Overtime", "Allowance", "Deduction"],
  PURCHASE: ["Raw Materials", "Equipment", "Services", "Inventory"],
  SALE: ["Product Sale", "Service", "Subscription", "Commission"],
  CUSTOMER: ["Payment", "Refund", "Discount", "Credit Note"],
  CUSTOM: ["Miscellaneous", "Other"],
};

export function LedgerEntryForm({
  open,
  onClose,
  selectedType,
}: LedgerEntryFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<LedgerEntryFormData>({
    resolver: zodResolver(ledgerEntrySchema),
    defaultValues: {
      type: (selectedType as any) || "SALE",
      customType: "",
      title: "",
      description: "",
      amount: 0,
      transactionType: "CREDIT",
      date: new Date(),
      reference: "",
      category: "",
      paymentMethod: "",
      tags: [],
    },
  });

  const createEntry = useMutation({
    mutationFn: async (data: LedgerEntryFormData) => {
      const response = await fetch("/api/ledgers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tags }),
      });
      if (!response.ok) throw new Error("Failed to create entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger-entries"] });
      queryClient.invalidateQueries({ queryKey: ["ledger-stats"] });
      toast.success("Ledger entry created successfully!");
      onClose();
      form.reset();
      setTags([]);
    },
    onError: () => {
      toast.error("Failed to create ledger entry");
    },
  });

  const onSubmit = (data: LedgerEntryFormData) => {
    createEntry.mutate({ ...data, tags });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const selectedLedgerType = form.watch("type");
  const currentCategories = COMMON_CATEGORIES[selectedLedgerType] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg"
            >
              <FileText className="h-6 w-6 text-white" />
            </motion.div>
            Create New Ledger Entry
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium">
                      Ledger Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                          <SelectValue placeholder="Select ledger type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="BANK">🏦 Bank Ledger</SelectItem>
                        <SelectItem value="EXPENSE">
                          💸 Expense Ledger
                        </SelectItem>
                        <SelectItem value="SALARY">💰 Salary Ledger</SelectItem>
                        <SelectItem value="PURCHASE">
                          🛒 Purchase Ledger
                        </SelectItem>
                        <SelectItem value="SALE">💹 Sale Ledger</SelectItem>
                        <SelectItem value="CUSTOMER">
                          👥 Customer Ledger
                        </SelectItem>
                        <SelectItem value="CUSTOM">⚙️ Custom Ledger</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {selectedLedgerType === "CUSTOM" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <FormField
                      control={form.control}
                      name="customType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-medium">
                            Custom Type Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Investment, Loan"
                              className="bg-slate-800 border-slate-600 text-slate-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator className="bg-slate-700" />

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction title"
                        className="bg-slate-800 border-slate-600 text-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-slate-800 border-slate-600 text-slate-200"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium">
                      Transaction Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="CREDIT">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Credit (Incoming)
                          </div>
                        </SelectItem>
                        <SelectItem value="DEBIT">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Debit (Outgoing)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full bg-slate-800 border-slate-600 text-slate-200 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ?
                              format(field.value, "PPP")
                            : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDatePickerOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-slate-700" />

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {currentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Payment Method
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Reference Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Transaction reference"
                        className="bg-slate-800 border-slate-600 text-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    className="bg-slate-800 border-slate-600 text-slate-200"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this transaction..."
                      className="bg-slate-800 border-slate-600 text-slate-200 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="bg-slate-700" />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEntry.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {createEntry.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
