import { useQuery } from "@tanstack/react-query";

interface Ledger {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export const useLedgers = () => {
  const { data: ledgers, isLoading } = useQuery<Ledger[]>({
    queryKey: ["ledgers"],
    queryFn: async () => {
      const response = await fetch("/api/ledgers");
      if (!response.ok) {
        throw new Error("Failed to fetch ledgers");
      }
      return response.json();
    },
  });

  return { ledgers, isLoading };
};
