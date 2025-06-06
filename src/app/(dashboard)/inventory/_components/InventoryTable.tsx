"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  sku: z.string(),
  stock: z.number(),
  price: z.number(),
  unit: z.string(),
  minStock: z.number(),
  maxStock: z.number(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.1,
    },
  },
};

export function InventoryTable({
  items,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (items) {
      setIsLoading(false);
    }
  }, [items]);

  const categories = ["all", ...new Set(items.map((item) => item.category))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="rounded-md border border-muted-foreground/20 bg-background/50 backdrop-blur-sm">
          <div className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tableVariants}
      className="space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200 hover:border-primary/30"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200 hover:border-primary/30">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border-muted-foreground/20">
            {categories.map((category) => (
              <SelectItem
                key={category}
                value={category}
                className="capitalize hover:bg-primary/10 transition-colors"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <ScrollArea className="h-[500px] rounded-md border border-muted-foreground/20 bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] text-muted-foreground/80">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Name
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground/80">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Category
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
                  Price
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground/80">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right text-muted-foreground/80">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.tr
                  key={item.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group relative hover:bg-white/5 transition-all duration-200"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-foreground/90 group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        SKU: {item.sku}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="capitalize bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-105"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-foreground/90 group-hover:text-primary transition-colors">
                        {item.stock} {item.unit}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        Min: {item.minStock}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-foreground/90 group-hover:text-primary transition-colors">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        Total: ${(item.price * item.stock).toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize transition-all duration-200 hover:scale-105",
                        item.stock <= item.minStock ?
                          "border-red-500/50 text-red-500 bg-red-500/10 hover:bg-red-500/20"
                        : item.stock >= item.maxStock ?
                          "border-green-500/50 text-green-500 bg-green-500/10 hover:bg-green-500/20"
                        : "border-yellow-500/50 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
                      )}
                    >
                      {item.stock <= item.minStock ?
                        "Low Stock"
                      : item.stock >= item.maxStock ?
                        "Overstocked"
                      : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px] bg-background/95 backdrop-blur-sm border-muted-foreground/20"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(item)}
                          className="cursor-pointer hover:bg-primary/10 transition-all duration-200"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id)}
                          className="cursor-pointer text-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </ScrollArea>
    </motion.div>
  );
}
