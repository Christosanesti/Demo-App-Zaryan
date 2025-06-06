import { currentUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Separate client component for React Query
const InventoryClient = () => {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Inventory Items</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ?
            <div className="text-sm text-muted-foreground">Loading...</div>
          : inventory?.length === 0 ?
            <div className="text-sm text-muted-foreground">
              No inventory items found.
            </div>
          : <div className="space-y-4">
              {/* TODO: Add inventory items list */}
            </div>
          }
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Server component wrapper
export const InventoryList = async () => {
  const user = await currentUser();

  return <InventoryClient />;
};
