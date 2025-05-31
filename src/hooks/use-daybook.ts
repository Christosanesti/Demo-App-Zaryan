import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

export type DaybookEntry = {
  id: string;
  date: Date;
  type: "income" | "expense";
  amount: number;
  description: string;
  reference?: string;
  category?: string;
  paymentMethod?: string;
  status: "pending" | "completed" | "cancelled";
  attachments?: string[];
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface DaybookSummary {
  entries: DaybookEntry[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}

type CreateDaybookData = {
  date: Date;
  type: "income" | "expense";
  amount: number;
  description: string;
  reference?: string;
  category?: string;
  paymentMethod?: string;
  status?: "pending" | "completed" | "cancelled";
  attachments?: string[];
  notes?: string;
};

interface UpdateDaybookData extends Partial<CreateDaybookData> {
  id: string;
}

export const useDaybook = () => {
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery<DaybookEntry[]>({
    queryKey: ["daybook"],
    queryFn: async () => {
      const response = await fetch("/api/daybook");
      if (!response.ok) {
        throw new Error("Failed to fetch daybook entries");
      }
      return response.json();
    },
  });

  // Calculate summary based on entries
  const summary = useMemo(() => {
    if (!entries) {
      return { income: 0, expense: 0, balance: 0 };
    }

    const income = entries
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const expense = entries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const balance = income - expense;

    return { income, expense, balance };
  }, [entries]);

  const { mutate: createEntry, isPending: isCreating } = useMutation({
    mutationFn: async (newEntry: CreateDaybookData) => {
      const response = await fetch("/api/daybook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          date: newEntry.date.toISOString(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create daybook entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Daybook entry created successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ?
          error.message
        : "Failed to create daybook entry"
      );
    },
  });

  const { mutate: updateEntry, isPending: isUpdating } = useMutation({
    mutationFn: async (
      updatedEntry: Partial<DaybookEntry> & { id: string }
    ) => {
      const response = await fetch(`/api/daybook/${updatedEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });
      if (!response.ok) {
        throw new Error("Failed to update daybook entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Daybook entry updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ?
          error.message
        : "Failed to update daybook entry"
      );
    },
  });

  const { mutate: deleteEntry, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/daybook/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete daybook entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook"] });
      toast.success("Daybook entry deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ?
          error.message
        : "Failed to delete daybook entry"
      );
    },
  });

  return {
    entries,
    summary,
    isLoading,
    createEntry,
    isCreating,
    updateEntry,
    isUpdating,
    deleteEntry,
    isDeleting,
  };
};
