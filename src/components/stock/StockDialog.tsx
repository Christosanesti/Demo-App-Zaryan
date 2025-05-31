import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StockForm } from "./StockForm";
import type { StockFormValues } from "@/hooks/use-stock";

interface StockDialogProps {
  mode?: "add" | "edit";
  initialData?: StockFormValues;
}

export function StockDialog({ mode = "add", initialData }: StockDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ?
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        : <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Stock Entry" : "Edit Stock Entry"}
          </DialogTitle>
        </DialogHeader>
        <StockForm initialData={initialData} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
