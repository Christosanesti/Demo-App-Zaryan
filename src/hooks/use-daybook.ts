import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface DaybookEntry {
  id: string;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DaybookSummary {
  entries: DaybookEntry[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}

interface CreateDaybookData {
  date: Date;
  amount: number;
  type: "income" | "expense";
  description: string;
  reference: string;
  category: string;
  paymentMethod: "cash" | "bank" | "mobile";
  status: "completed" | "pending" | "cancelled";
  attachments?: string;
  notes?: string;
}

interface UpdateDaybookData extends Partial<CreateDaybookData> {
  id: string;
}

export const useDaybook = () => {
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
        throw new Error("Failed to create daybook entry");
      }
      return response.json();
    },
    onSuccess: () => {
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
      const response = await fetch("/api/daybook", {
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
      const response = await fetch(`/api/daybook?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete daybook entry");
      }
    },
    onSuccess: () => {
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
    isLoading,
    createEntry,
    isCreating,
    updateEntry,
    isUpdating,
    deleteEntry,
    isDeleting,
  };
};
