"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Package, DollarSign } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().min(1, "Supplier is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

const units = ["pcs", "kg", "g", "l", "ml", "box", "pack"];
const categories = ["Raw Materials", "Finished Goods", "Packaging", "Supplies"];
const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "Check"];

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export function InventoryPurchase() {
  const queryClient = useQueryClient();
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      productName: "",
      quantity: "",
      unit: "",
      price: "",
      category: "",
      supplier: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["inventory-purchases"],
    queryFn: async () => {
      const response = await fetch("/api/inventory/purchases");
      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }
      return response.json();
    },
  });

  const { mutate: createPurchase, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/inventory/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Failed to create purchase");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Purchase added successfully");
      form.reset();
      setIsAddingPurchase(false);
    },
    onError: () => {
      toast.error("Failed to add purchase");
    },
  });

  const { mutate: deletePurchase } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory/purchases/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete purchase");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Purchase deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete purchase");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPurchase(values);
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-white/5 via-white/5 to-background backdrop-blur-sm border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Inventory Purchases
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Manage your inventory purchases and track expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setIsAddingPurchase(true)}
                className="bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 text-white shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </div>

            {isAddingPurchase && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    variant="outline"
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
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
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name"
                                {...field}
                                className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter quantity"
                                {...field}
                                className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50">
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
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
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter price"
                                {...field}
                                className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
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
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter supplier name"
                                {...field}
                                className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
                              />
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentMethods.map((method) => (
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

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Add any additional notes"
                              {...field}
                              className="bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingPurchase(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 text-white shadow-lg hover:shadow-primary/25 transition-all duration-300"
                      >
                        {isPending ? "Adding..." : "Add Purchase"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            <ScrollArea className="h-[500px] rounded-md border border-muted-foreground/20 bg-background/50 backdrop-blur-sm">
              <Table>
                <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Quantity
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Amount
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground/80">
                      Supplier
                    </TableHead>
                    <TableHead className="text-muted-foreground/80">
                      Payment
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {purchases?.map((purchase: any) => (
                      <motion.tr
                        key={purchase.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="group relative hover:bg-white/5 transition-all duration-200"
                      >
                        <TableCell>
                          {format(new Date(purchase.date), "PPP")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-foreground/90 group-hover:text-primary transition-colors">
                              {purchase.productName}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                              {purchase.category}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground/90 group-hover:text-primary transition-colors">
                              {purchase.quantity} {purchase.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground/90 group-hover:text-primary transition-colors">
                              ${purchase.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                              Total: $
                              {(purchase.price * purchase.quantity).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="capitalize bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-105"
                          >
                            {purchase.supplier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize transition-all duration-200 hover:scale-105"
                          >
                            {purchase.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePurchase(purchase.id)}
                            className="text-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
