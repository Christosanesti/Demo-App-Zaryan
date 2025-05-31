"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Mail,
  Printer,
  Download,
  Eye,
  Send,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  X,
  Edit,
  MoreHorizontal,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PageHeader,
  EnhancedCard,
  StatCard,
  PageContainer,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui/design-system";

interface InvoicesClientProps {
  userSettings: any;
}

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0.01, "Rate must be greater than 0"),
  amount: z.number(),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  discount: z.number().min(0),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function InvoicesClient({ userSettings }: InvoicesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      invoiceNumber: "",
      issueDate: "",
      dueDate: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      taxRate: 0,
      discount: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch invoices
  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch("/api/invoices");
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      return response.json();
    },
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
  });

  // Fetch invoice stats
  const { data: stats } = useQuery({
    queryKey: ["invoice-stats"],
    queryFn: async () => {
      const response = await fetch("/api/invoices/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch invoice stats");
      }
      return response.json();
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create invoice");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-stats"] });
      setDialogOpen(false);
      form.reset();
      toast.success("Invoice created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const taxAmount = (subtotal * data.taxRate) / 100;
    const total = subtotal + taxAmount - data.discount;

    const invoiceData = {
      ...data,
      subtotal,
      taxAmount,
      total,
      status: "draft",
    };

    createInvoiceMutation.mutate(invoiceData as any);
  };

  // Calculate item amount when quantity or rate changes
  const updateItemAmount = (index: number) => {
    const quantity = form.watch(`items.${index}.quantity`);
    const rate = form.watch(`items.${index}.rate`);
    const amount = quantity * rate;
    form.setValue(`items.${index}.amount`, amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        variant: "outline" as const,
        className: "border-gray-500/30 text-gray-400",
        icon: Edit,
      },
      sent: {
        variant: "outline" as const,
        className: "border-blue-500/30 text-blue-400",
        icon: Send,
      },
      paid: {
        variant: "outline" as const,
        className: "border-emerald-500/30 text-emerald-400",
        icon: CheckCircle,
      },
      overdue: {
        variant: "outline" as const,
        className: "border-red-500/30 text-red-400",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (invoicesLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  const statCards = [
    {
      title: "Total Invoiced",
      value: stats?.totalInvoiced || "$0",
      change: "↗ 18% from last month",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      gradientFrom: "from-emerald-500/20",
      gradientTo: "to-teal-600/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Outstanding",
      value: stats?.outstanding || "$0",
      change: "↘ 8% from last month",
      icon: Clock,
      color: "from-orange-500 to-red-600",
      gradientFrom: "from-orange-500/20",
      gradientTo: "to-red-600/20",
      iconColor: "text-orange-400",
    },
    {
      title: "Paid Invoices",
      value: stats?.paidCount || "0",
      change: "↗ 22% from last month",
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-600",
      gradientFrom: "from-blue-500/20",
      gradientTo: "to-cyan-600/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Overdue",
      value: stats?.overdueCount || "0",
      change: "↘ 12% from last month",
      icon: AlertCircle,
      color: "from-purple-500 to-pink-600",
      gradientFrom: "from-purple-500/20",
      gradientTo: "to-pink-600/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Invoice Management"
        description="Create, track, and manage your business invoices with ease"
        badges={[
          {
            text: "Billing",
            icon: FileText,
            color: "border-blue-500/30 text-blue-400",
          },
          {
            text: "Financial",
            icon: DollarSign,
            color: "border-emerald-500/30 text-emerald-400",
          },
        ]}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800/95 backdrop-blur-sm border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-2xl text-slate-200 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-400" />
                Create New Invoice
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill in the details below to create a new invoice
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Customer
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {customers?.map((customer: any) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id}
                                className="text-slate-200"
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
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Invoice Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                            placeholder="INV-001"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Issue Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Due Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-slate-700/50" />

                {/* Invoice Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-200">
                      Invoice Items
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        append({
                          description: "",
                          quantity: 1,
                          rate: 0,
                          amount: 0,
                        })
                      }
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                      >
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-slate-300">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                                  placeholder="Item description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">
                                Qty
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    updateItemAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">
                                Rate
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    updateItemAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-end justify-between">
                          <div className="text-slate-300 font-medium">
                            ${form.watch(`items.${index}.amount`) || 0}
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Tax Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Discount ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200"
                          placeholder="Additional notes or terms..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createInvoiceMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                  >
                    {createInvoiceMutation.isPending ?
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    : <>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Invoice
                      </>
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Invoices List */}
      <EnhancedCard
        title="Invoices"
        description="Manage and track all your invoices"
        icon={FileText}
        iconColor="text-blue-400"
      >
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-slate-800/50 border-slate-700/50 text-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-200">
                All Status
              </SelectItem>
              <SelectItem value="draft" className="text-slate-200">
                Draft
              </SelectItem>
              <SelectItem value="sent" className="text-slate-200">
                Sent
              </SelectItem>
              <SelectItem value="paid" className="text-slate-200">
                Paid
              </SelectItem>
              <SelectItem value="overdue" className="text-slate-200">
                Overdue
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {invoicesError ?
          <EmptyState
            icon={AlertCircle}
            title="Failed to Load Invoices"
            description="There was an error loading your invoices. Please try again."
            action={{
              label: "Retry",
              onClick: () => window.location.reload(),
            }}
          />
        : filteredInvoices?.length === 0 ?
          <EmptyState
            icon={FileText}
            title="No Invoices Found"
            description={
              searchTerm || statusFilter !== "all" ?
                "No invoices match your current filters. Try adjusting your search criteria."
              : "You haven't created any invoices yet. Create your first invoice to get started."
            }
            action={
              searchTerm || statusFilter !== "all" ?
                {
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  },
                }
              : {
                  label: "Create First Invoice",
                  onClick: () => setDialogOpen(true),
                }
            }
          />
        : <div className="space-y-4">
            {filteredInvoices?.map((invoice: any, index: number) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-200 text-lg">
                            {invoice.invoiceNumber}
                          </h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-slate-400 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {invoice.customer?.name || "Unknown Customer"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />$
                            {invoice.total?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
                              <Send className="w-4 h-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        }
      </EnhancedCard>
    </PageContainer>
  );
}
