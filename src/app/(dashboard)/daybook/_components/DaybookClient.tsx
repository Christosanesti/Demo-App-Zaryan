"use client";

import React from "react";
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
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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

const formSchema = z.object({
  date: z.date(),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
  category: z.string().default("uncategorized"),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).default("cash"),
  status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
  attachments: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DaybookClientProps {
  userSettings: {
    currency: string;
  };
}

export default function DaybookClient({ userSettings }: DaybookClientProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [filters, setFilters] = React.useState({
    type: "",
    category: "",
    status: "",
  });

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

  const { data, isLoading } = useQuery({
    queryKey: ["daybook", format(selectedDate, "yyyy-MM-dd"), filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: format(selectedDate, "yyyy-MM-dd"),
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/daybook?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch daybook entries");
      }
      return response.json();
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
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      form.reset();
      toast.success("Entry created successfully", {
        description: "Your daybook entry has been added.",
      });
    },
    onError: (error) => {
      toast.error("Failed to create entry", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/daybook?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Entry deleted successfully", {
        description: "The entry has been removed from your daybook.",
      });
    },
    onError: () => {
      toast.error("Failed to delete entry", {
        description: "There was an error deleting the entry. Please try again.",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        date: values.date || new Date(),
        amount: Number(values.amount),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userSettings.currency,
    }).format(amount);
  };

  const handleDateChange = (days: number) => {
    setSelectedDate((prev) => addDays(prev, days));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Entry</CardTitle>
              <CardDescription>
                Record your daily income and expenses
              </CardDescription>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter your daybook entries
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFilters((prev) => ({ ...prev, type: value }));
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFilters((prev) => ({
                              ...prev,
                              category: value,
                            }));
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            <SelectItem value="uncategorized">
                              Uncategorized
                            </SelectItem>
                            {/* Add more categories here */}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFilters((prev) => ({ ...prev, status: value }));
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ?
                                format(field.value, "PPP")
                              : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
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

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uncategorized">
                              Uncategorized
                            </SelectItem>
                            {/* Add more categories here */}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank">Bank</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || !form.formState.isValid}
              >
                {createMutation.isPending ?
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Adding...</span>
                  </div>
                : "Add Entry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Entries</CardTitle>
                <CardDescription>
                  {format(selectedDate, "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {isLoading ?
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              : data?.entries.length === 0 ?
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No entries for today</p>
                </div>
              : <div className="space-y-4">
                  <AnimatePresence>
                    {data?.entries.map((entry: any) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {entry.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.category}</Badge>
                            <Badge variant="outline">
                              {entry.paymentMethod}
                            </Badge>
                            <Badge
                              variant={
                                entry.status === "completed" ? "default"
                                : entry.status === "pending" ?
                                  "secondary"
                                : "destructive"
                              }
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              entry.type === "income" ?
                                "default"
                              : "destructive"
                            }
                          >
                            {formatCurrency(entry.amount)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(entry.id)}
                          >
                            <Plus className="h-4 w-4 rotate-45" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              }
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Today's totals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Income</p>
                  <p className="text-sm font-medium text-green-600">
                    {isLoading ?
                      "..."
                    : formatCurrency(data?.totals?.income || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Expenses</p>
                  <p className="text-sm font-medium text-red-600">
                    {isLoading ?
                      "..."
                    : formatCurrency(data?.totals?.expense || 0)}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Net Amount</p>
                  <p
                    className={`text-sm font-medium ${
                      isLoading ? ""
                      : (
                        (data?.totals?.income || 0) -
                          (data?.totals?.expense || 0) >=
                        0
                      ) ?
                        "text-green-600"
                      : "text-red-600"
                    }`}
                  >
                    {isLoading ?
                      "..."
                    : formatCurrency(
                        (data?.totals?.income || 0) -
                          (data?.totals?.expense || 0)
                      )
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Today's category totals</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="income">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
                <TabsContent value="income">
                  <div className="space-y-4">
                    {isLoading ?
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    : Object.entries(data?.categoryTotals || {}).length === 0 ?
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          No categories found
                        </p>
                      </div>
                    : Object.entries(data?.categoryTotals || {}).map(
                        ([category, totals]: [string, any]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <p className="text-sm font-medium">{category}</p>
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(totals?.income || 0)}
                            </p>
                          </div>
                        )
                      )
                    }
                  </div>
                </TabsContent>
                <TabsContent value="expense">
                  <div className="space-y-4">
                    {isLoading ?
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    : Object.entries(data?.categoryTotals || {}).length === 0 ?
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          No categories found
                        </p>
                      </div>
                    : Object.entries(data?.categoryTotals || {}).map(
                        ([category, totals]: [string, any]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <p className="text-sm font-medium">{category}</p>
                            <p className="text-sm font-medium text-red-600">
                              {formatCurrency(totals?.expense || 0)}
                            </p>
                          </div>
                        )
                      )
                    }
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
