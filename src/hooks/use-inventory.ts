import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: Date;
  updatedAt: Date;
}

interface CreateInventoryData {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  category: string;
  supplier?: string;
  reorderLevel?: number;
  location?: string;
  sku?: string;
  barcode?: string;
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
