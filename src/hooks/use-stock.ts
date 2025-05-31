import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Stock = {
  id: string;
  date: string;
  productName: string;
  amount: number;
  quantity: number;
  description?: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
};

export type StockFormValues = {
  date: string;
  productName: string;
  amount: number;
  quantity: number;
  description?: string;
};

export function useStock() {
  const queryClient = useQueryClient();

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const response = await fetch("/api/stock");
      if (!response.ok) {
        throw new Error("Failed to fetch stocks");
      }
      const data = await response.json();
      return data as Stock[];
    },
  });

  const createStock = useMutation({
    mutationFn: async (values: StockFormValues) => {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Failed to create stock");
      }
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      toast.success("Stock entry created successfully");
    },
    onError: (error) => {
      console.error("[STOCK_CREATE]", error);
      toast.error("Something went wrong");
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: StockFormValues;
    }) => {
      const response = await fetch(`/api/stock/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Failed to update stock");
      }
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      toast.success("Stock entry updated successfully");
    },
    onError: (error) => {
      console.error("[STOCK_UPDATE]", error);
      toast.error("Something went wrong");
    },
  });

  const deleteStock = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/stock/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete stock");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      toast.success("Stock entry deleted successfully");
    },
    onError: (error) => {
      console.error("[STOCK_DELETE]", error);
      toast.error("Something went wrong");
    },
  });

  return {
    stocks,
    isLoading,
    createStock,
    updateStock,
    deleteStock,
  };
}
