import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryForm } from "./inventory-form";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryDialog({ open, onOpenChange }: InventoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
