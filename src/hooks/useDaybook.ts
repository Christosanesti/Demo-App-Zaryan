import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

interface DaybookEntry {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  reference: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEntryData {
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  reference: string;
}

export function useDaybook() {
  const queryClient = useQueryClient();

  // Fetch entries
  const { data: entries, isLoading } = useQuery<DaybookEntry[]>({
    queryKey: ["daybook-entries"],
    queryFn: async () => {
      const response = await fetch("/api/daybook");
      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }
      const data = await response.json();
      return data.entries || [];
    },
  });

  // Calculate summary
  const summary = useMemo(() => {
    if (!entries) return { income: 0, expense: 0, balance: 0 };

    const income = entries
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const expense = entries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [entries]);

  // Create entry
  const createEntry = useMutation({
    mutationFn: async (data: CreateEntryData) => {
      const response = await fetch("/api/daybook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook-entries"] });
      toast.success("Entry created successfully");
    },
    onError: () => {
      toast.error("Failed to create entry");
    },
  });

  // Update entry
  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEntryData>;
    }) => {
      const response = await fetch(`/api/daybook/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook-entries"] });
      toast.success("Entry updated successfully");
    },
    onError: () => {
      toast.error("Failed to update entry");
    },
  });

  // Delete entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/daybook/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daybook-entries"] });
      toast.success("Entry deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete entry");
    },
  });

  return {
    entries,
    summary,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
