import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { InventoryDialog } from "@/components/inventory/inventory-dialog";
import { DaybookDialog } from "@/components/daybook/daybook-dialog";

const QuickActionMenu = () => {
  const router = useRouter();
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [daybookDialogOpen, setDaybookDialogOpen] = useState(false);

  const actions = [
    {
      label: "New Daybook Entry",
      description: "Record income or expense",
      onClick: () => setDaybookDialogOpen(true),
    },
    {
      label: "Add Inventory",
      description: "Add new stock items",
      onClick: () => setInventoryDialogOpen(true),
    },
    {
      label: "New Customer",
      description: "Add a new customer",
      onClick: () => router.push("/customers/new"),
    },
  ];

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="grid gap-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 hover:bg-accent"
                  onClick={action.onClick}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{action.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <InventoryDialog
        open={inventoryDialogOpen}
        onOpenChange={setInventoryDialogOpen}
      />
      <DaybookDialog
        open={daybookDialogOpen}
        onOpenChange={setDaybookDialogOpen}
      />
    </>
  );
};

export default QuickActionMenu;
