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
import { Plus, Filter, Wallet, Calendar, Users, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { format } from "date-fns";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  inventoryId: z.string().min(1, "Product is required"),
  amount: z.number().positive("Amount must be positive"),
  advancePayment: z.number().min(0, "Advance payment cannot be negative"),
  paymentMode: z.enum(["cash", "bank"]),
  installmentMonths: z.number().int().min(1, "Must be at least 1 month"),
});

type FormValues = z.infer<typeof formSchema>;

interface SalesClientProps {
  userSettings: any;
}

export default function SalesClient({ userSettings }: SalesClientProps) {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      advancePayment: 0,
      paymentMode: "cash",
      installmentMonths: 1,
    },
  });

  // Fetch sales
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await fetch("/api/sales");
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  // Fetch inventory for dropdown
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory");
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
  });

  // Create sale mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to create sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale created successfully!");
      form.reset();
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create sale");
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userSettings?.currency || "USD",
    }).format(amount);
  };

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
                  Sales Management
                </motion.h1>
                <motion.p
                  className="text-slate-400 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Manage sales transactions and installments
                </motion.p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-400"
                  >
                    <Wallet className="w-3 h-3 mr-1" />
                    {sales.length} Sales
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400"
                  >
                    Active Status
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
                      New Sale
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] bg-slate-900/95 border-slate-700/50 backdrop-blur-lg">
                  <SheetHeader>
                    <SheetTitle className="text-slate-200 text-xl">
                      Create New Sale
                    </SheetTitle>
                    <SheetDescription className="text-slate-400">
                      Add a new sale transaction with installment options
                    </SheetDescription>
                  </SheetHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6 mt-6"
                    >
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Customer
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 hover:border-slate-500/50 transition-colors">
                                  <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-lg">
                                {customers.map((customer: any) => (
                                  <SelectItem
                                    key={customer.id}
                                    value={customer.id}
                                    className="hover:bg-slate-700/50"
                                  >
                                    {customer.name}
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
                        name="inventoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Product
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 hover:border-slate-500/50 transition-colors">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-lg">
                                {inventory.map((item: any) => (
                                  <SelectItem
                                    key={item.id}
                                    value={item.id}
                                    className="hover:bg-slate-700/50"
                                  >
                                    {item.name} - {formatCurrency(item.price)}
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
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Total Amount
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-slate-800/50 border-slate-600/50"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="advancePayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Advance Payment
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-slate-800/50 border-slate-600/50"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="installmentMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Installment Months
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="bg-slate-800/50 border-slate-600/50"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300 font-medium">
                              Payment Mode
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 hover:border-slate-500/50 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-lg">
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">
                                  Bank Transfer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsSheetOpen(false)}
                          className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {createMutation.isPending ?
                            "Creating..."
                          : "Create Sale"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Enhanced Sales List */}
        <Card className="relative overflow-hidden bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

          <CardHeader className="relative">
            <CardTitle className="text-slate-200 flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-400" />
              </div>
              Sales Transactions
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Manage your sales and track installments
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <ScrollArea className="h-[600px]">
              {isLoading ?
                <div className="flex items-center justify-center h-32">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500/30 border-t-blue-500"></div>
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>
                  </div>
                </div>
              : sales.length === 0 ?
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <Wallet className="relative mx-auto h-16 w-16 text-slate-400 mb-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-3">
                    No sales yet
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Create your first sale to get started with transaction
                    management
                  </p>
                  <Button
                    onClick={() => setIsSheetOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Sale
                  </Button>
                </div>
              : <div className="space-y-4">
                  <AnimatePresence>
                    {sales.map((sale: any, index: number) => (
                      <motion.div
                        key={sale.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-between p-6 border border-slate-700/50 rounded-xl bg-slate-800/30 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1 bg-blue-500/20 rounded-md">
                                <Users className="h-4 w-4 text-blue-400" />
                              </div>
                              <p className="font-medium text-slate-200">
                                {sale.customer?.name || "Unknown Customer"}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs border-purple-500/30 text-purple-400"
                              >
                                {sale.inventory?.name || "Unknown Product"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                Total: {formatCurrency(sale.amount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                                Advance: {formatCurrency(sale.advancePayment)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                                {sale.installments?.length || 0} installments
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  sale.status === "active" ?
                                    "default"
                                  : "secondary"
                                }
                                className={`text-xs ${
                                  sale.status === "active" ?
                                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                                }`}
                              >
                                {sale.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs border-slate-500/30"
                              >
                                {sale.paymentMode}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              }
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
