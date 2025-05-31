import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

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
      const { data } = await axios.get("/api/stock");
      return data as Stock[];
    },
  });

  const createStock = useMutation({
    mutationFn: async (values: StockFormValues) => {
      const { data } = await axios.post("/api/stock", values);
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
      const { data } = await axios.patch(`/api/stock/${id}`, values);
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
      await axios.delete(`/api/stock/${id}`);
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
