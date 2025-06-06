"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing"; //don't change this

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorAddress: string | null;
  documentsUrl: string | null;
  createdAt: string;
  sales: {
    id: string;
    totalAmount: number;
    createdAt: string;
  }[];
}

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [documentsUrl, setDocumentsUrl] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!formData.get("name")) {
        throw new Error("Customer name is required");
      }

      if (photoUrl) {
        formData.append("photoUrl", photoUrl);
      }
      if (documentsUrl) {
        formData.append("documentsUrl", documentsUrl);
      }

      const response = await fetch("/api/customers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add customer");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Customer added successfully");
      setIsSheetOpen(false);
      setPhotoUrl(null);
      setDocumentsUrl(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add customer");
    },
  });

  const handleAddCustomer = async (formData: FormData) => {
    addCustomerMutation.mutate(formData);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setPhotoUrl(null);
      setDocumentsUrl(null);
    }
  };

  const filteredCustomers = customers?.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "withGuarantor" && customer.guarantorName) ||
      (filterBy === "withSales" && customer.sales.length > 0);

    return matchesSearch && matchesFilter;
  });

  const sortedCustomers = filteredCustomers?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "sales":
        return b.sales.length - a.sales.length;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-slate-400">Manage your customer database</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-slate-900 border-slate-800">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Add New Customer
              </SheetTitle>
              <SheetDescription className="text-slate-400">
                Fill in the customer details below
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
              <form action={handleAddCustomer} className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Customer Photo</Label>
                    <div className="flex items-center gap-4">
                      <motion.div layout className="h-24 w-24">
                        {photoUrl ?
                          <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative h-full w-full rounded-full overflow-hidden border-2 border-blue-500/50"
                          >
                            <Image
                              src={photoUrl}
                              alt="Customer photo"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => setPhotoUrl(null)}
                              className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </motion.div>
                        : <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full w-full rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center"
                          >
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                          </motion.div>
                        }
                      </motion.div>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]?.url) {
                            setPhotoUrl(res[0].url);
                            toast.success("Photo uploaded successfully");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(
                            `Failed to upload photo: ${error.message}`
                          );
                        }}
                        className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-button:transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Customer Documents</Label>
                    <div className="flex items-center gap-4">
                      {documentsUrl ?
                        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-blue-500/50">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-slate-200">
                            Document uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => setDocumentsUrl(null)}
                            className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                      : <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-dashed border-slate-700/50">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-400">
                            No document uploaded
                          </span>
                        </div>
                      }
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]?.url) {
                            setDocumentsUrl(res[0].url);
                            toast.success("Document uploaded successfully");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(
                            `Failed to upload document: ${error.message}`
                          );
                        }}
                        className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-button:transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-200">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-200">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorName" className="text-slate-200">
                      Guarantor Name
                    </Label>
                    <Input
                      id="guarantorName"
                      name="guarantorName"
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter guarantor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorPhone" className="text-slate-200">
                      Guarantor Phone
                    </Label>
                    <Input
                      id="guarantorPhone"
                      name="guarantorPhone"
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter guarantor phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="guarantorAddress"
                      className="text-slate-200"
                    >
                      Guarantor Address
                    </Label>
                    <Input
                      id="guarantorAddress"
                      name="guarantorAddress"
                      className="bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
                      placeholder="Enter guarantor address"
                    />
                  </div>
                </div>
                <SheetFooter className="sticky bottom-0 bg-slate-900 pt-4 border-t border-slate-800">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="border-slate-700/50 hover:bg-slate-800/50"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Add Customer
                  </Button>
                </SheetFooter>
              </form>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search customers..."
            className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="sales">Most Sales</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700/50">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="withGuarantor">With Guarantor</SelectItem>
            <SelectItem value="withSales">With Sales</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ?
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full"
            >
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        : <AnimatePresence mode="wait">
            {sortedCustomers?.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: "easeInOut",
                }}
                className="w-full"
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/20">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-slate-700/50"
                            >
                              {customer.sales.length} sales
                            </Badge>
                            {customer.guarantorName && (
                              <Badge
                                variant="outline"
                                className="border-blue-500/50 text-blue-400"
                              >
                                Has Guarantor
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-slate-700/50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-800 border-slate-700"
                        >
                          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 cursor-pointer">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 cursor-pointer">
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-slate-700 cursor-pointer">
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 space-y-3">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                          <MapPin className="h-4 w-4" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                      {customer.guarantorName && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                          <Users className="h-4 w-4" />
                          <span>Guarantor: {customer.guarantorName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Total Sales
                        </span>
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          $
                          {customer.sales
                            .reduce((sum, sale) => sum + sale.totalAmount, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        }
      </div>
    </div>
  );
}
