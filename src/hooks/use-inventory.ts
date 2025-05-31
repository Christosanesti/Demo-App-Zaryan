import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

type CreateInventoryData = {
  name: string;
  category?: string;
  sku?: string;
  quantity: number;
  price: number;
  costPrice?: number;
  description?: string;
  supplier?: string;
  location?: string;
  minStockLevel?: number;
  unit?: string;
  tags?: string[];
  barcode?: string;
  expiryDate?: Date;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  condition?: "new" | "used" | "refurbished";
  warrantyPeriod?: number;
  images?: string[];
};

export interface InventoryItem {
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

interface UpdateInventoryData extends Partial<CreateInventoryData> {
  id: string;
}

export const useInventory = () => {
  const { data: inventory, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      return response.json();
    },
  });

  // Calculate summary based on inventory
  const summary = useMemo(() => {
    if (!inventory) {
      return { totalValue: 0, lowStockCount: 0 };
    }

    const totalValue = inventory.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const lowStockCount = inventory.filter(
      (item) => item.quantity <= 10
    ).length;

    return { totalValue, lowStockCount };
  }, [inventory]);

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: async (
      newItem: Omit<InventoryItem, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        throw new Error("Failed to create inventory item");
      }
      return response.json();
    },
  });

  const { mutate: updateItem, isPending: isUpdating } = useMutation({
    mutationFn: async (
      updatedItem: Partial<InventoryItem> & { id: string }
    ) => {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) {
        throw new Error("Failed to update inventory item");
      }
      return response.json();
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete inventory item");
      }
    },
  });

  return {
    items: inventory,
    summary,
    inventory,
    isLoading,
    createItem,
    isCreating,
    updateItem,
    isUpdating,
    deleteItem,
    isDeleting,
  };
};
