import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
      return response.json();
    },
  });

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
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
