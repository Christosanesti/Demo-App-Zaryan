import { useMutation, useQuery } from "@tanstack/react-query";

interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  type: "individual" | "company";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export const useCustomers = () => {
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
  });

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create customer");
      }
      return response.json();
    },
  });

  return { customers, isLoading, createCustomer, isCreating };
};
