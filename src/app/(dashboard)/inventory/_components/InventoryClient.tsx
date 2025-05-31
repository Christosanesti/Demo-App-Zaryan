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
import { Search, Plus, Filter, Package } from "lucide-react";
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
import { UserSettings } from "@/lib/auth-utils";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.number().int().min(0),
  unit: z.string(),
  price: z.number().min(0),
  category: z.string(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
  minStock: z.number().int().min(0),
  maxStock: z.number().int().min(0).optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryClientProps {
  userSettings: UserSettings | null;
}

export default function InventoryClient({
  userSettings,
}: InventoryClientProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState({
    category: "",
    search: "",
    lowStock: false,
  });
  const [currency, setCurrency] = useState(userSettings?.currency || "USD");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      unit: "piece",
      price: 0,
      category: "uncategorized",
      minStock: 0,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.lowStock && { lowStock: "true" }),
      });

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items");
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      form.reset();
      toast.success("Item created successfully", {
        description: "Your inventory item has been added.",
      });
    },
    onError: (error) => {
      toast.error("Failed to create item", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item deleted successfully", {
        description: "The item has been removed from your inventory.",
      });
    },
    onError: () => {
      toast.error("Failed to delete item", {
        description: "There was an error deleting the item. Please try again.",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Item</CardTitle>
              <CardDescription>
                Add a new item to your inventory
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
                    Filter your inventory items
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
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
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search items..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Low Stock</FormLabel>
                    <FormControl>
                      <Select
                        value={filters.lowStock ? "true" : "false"}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            lowStock: value === "true",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Show low stock items" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">All Items</SelectItem>
                          <SelectItem value="true">Low Stock Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="piece">Piece</SelectItem>
                            <SelectItem value="kg">Kilogram</SelectItem>
                            <SelectItem value="g">Gram</SelectItem>
                            <SelectItem value="l">Liter</SelectItem>
                            <SelectItem value="ml">Milliliter</SelectItem>
                            <SelectItem value="m">Meter</SelectItem>
                            <SelectItem value="cm">Centimeter</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                          step="0.01"
                          min="0"
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
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              {isLoading ?
                "Loading..."
              : `${data?.items?.length || 0} items in your inventory`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {isLoading ?
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              : !data?.items || data.items.length === 0 ?
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No items found</p>
                </div>
              : <div className="space-y-4">
                  <AnimatePresence>
                    {data.items.map((item: any) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge variant="outline">{item.unit}</Badge>
                            <Badge
                              variant={
                                item.quantity <= item.minStock ?
                                  "destructive"
                                : "default"
                              }
                            >
                              {item.quantity} {item.unit}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            {formatCurrency(item.price)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
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
              <CardDescription>Inventory overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-sm font-medium">
                    {isLoading ? "..." : data?.totals?.totalItems || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Value</p>
                  <p className="text-sm font-medium">
                    {isLoading ?
                      "..."
                    : formatCurrency(data?.totals?.totalValue || 0)}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Low Stock Items</p>
                  <p className="text-sm font-medium text-red-600">
                    {isLoading ?
                      "..."
                    : data?.items?.filter(
                        (item: any) => item.quantity <= item.minStock
                      ).length || 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Items by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="items">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="value">Value</TabsTrigger>
                </TabsList>
                <TabsContent value="items">
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
                            <p className="text-sm font-medium">
                              {totals.items} items
                            </p>
                          </div>
                        )
                      )
                    }
                  </div>
                </TabsContent>
                <TabsContent value="value">
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
                            <p className="text-sm font-medium">
                              {formatCurrency(totals.value)}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-200">
              Inventory Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Currency
              </Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-slate-200"
                placeholder="Enter currency code (e.g., USD)"
              />
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
