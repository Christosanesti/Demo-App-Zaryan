"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDaybook } from "@/hooks/use-daybook";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLedgers } from "@/hooks/use-ledgers";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Type is required",
  }),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DaybookFormProps {
  onSubmit: (values: FormValues) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function DaybookForm({
  onSubmit,
  isSubmitting,
  onCancel,
}: DaybookFormProps) {
  const { createEntry, isCreating } = useDaybook();
  const { ledgers, isLoading: isLoadingLedgers } = useLedgers();
  const [showCustomLedger, setShowCustomLedger] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: "income",
      amount: 0,
      description: "",
      reference: "",
      category: "",
      paymentMethod: "cash",
      status: "completed",
      notes: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="space-y-6">
            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-200">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-slate-800/40 border-slate-700/50 text-slate-200",
                            !field.value && "text-slate-400"
                          )}
                        >
                          {field.value ?
                            format(field.value, "PPP")
                          : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-slate-800 border-slate-700"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="rounded-md border-slate-700"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Type Field */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/40 border-slate-700/50 text-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="income" className="text-slate-200">
                        Income
                      </SelectItem>
                      <SelectItem value="expense" className="text-slate-200">
                        Expense
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      className="bg-slate-800/40 border-slate-700/50 text-slate-200"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      className="bg-slate-800/40 border-slate-700/50 text-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Reference Field */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter reference (e.g., ledger, bank, customer)"
                      className="bg-slate-800/40 border-slate-700/50 text-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    Link to ledger, bank account, or customer
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/40 border-slate-700/50 text-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="sales" className="text-slate-200">
                        Sales
                      </SelectItem>
                      <SelectItem value="purchases" className="text-slate-200">
                        Purchases
                      </SelectItem>
                      <SelectItem value="payments" className="text-slate-200">
                        Payments
                      </SelectItem>
                      <SelectItem value="other" className="text-slate-200">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Payment Method Field */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Payment Method
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/40 border-slate-700/50 text-slate-200">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="cash" className="text-slate-200">
                        Cash
                      </SelectItem>
                      <SelectItem value="bank" className="text-slate-200">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="mobile" className="text-slate-200">
                        Mobile Payment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/40 border-slate-700/50 text-slate-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="completed" className="text-slate-200">
                        Completed
                      </SelectItem>
                      <SelectItem value="pending" className="text-slate-200">
                        Pending
                      </SelectItem>
                      <SelectItem value="cancelled" className="text-slate-200">
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes"
                      className="resize-none bg-slate-800/40 border-slate-700/50 text-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-slate-700/50 text-slate-200 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            : "Save Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
