"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Trash2, Package } from "lucide-react";
import { useInventory } from "@/hooks/use-inventory";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  costPrice?: number;
  sellingPrice?: number;
  category?: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  onEdit?: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  isLoading,
  onEdit,
}: InventoryTableProps) {
  const { deleteItem, isDeleting } = useInventory();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        toast.success("Item deleted successfully");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No inventory items</h3>
        <p className="text-muted-foreground">
          Get started by adding your first inventory item.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-md border"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.category || "General"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{item.quantity}</span>
                  {item.quantity <= 10 && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {formatCurrency(item.costPrice || item.price)}
              </TableCell>
              <TableCell>
                {formatCurrency(item.sellingPrice || item.price)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.quantity > 10 ? "default"
                    : item.quantity > 0 ?
                      "secondary"
                    : "destructive"
                  }
                >
                  {item.quantity > 10 ?
                    "In Stock"
                  : item.quantity > 0 ?
                    "Low Stock"
                  : "Out of Stock"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(item)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
