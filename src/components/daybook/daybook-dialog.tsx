import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DaybookForm } from "./daybook-form";

interface DaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DaybookDialog({ open, onOpenChange }: DaybookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Daybook Entry</DialogTitle>
        </DialogHeader>
        <DaybookForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
