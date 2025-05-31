import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DaybookForm } from "./DaybookForm";
import { useState } from "react";

interface DaybookDialogProps {
  mode?: "add" | "edit";
  initialData?: {
    id: string;
    date: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    reference: string;
  };
}

export function DaybookDialog({
  mode = "add",
  initialData,
}: DaybookDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ?
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        : <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Entry" : "Edit Entry"}
          </DialogTitle>
        </DialogHeader>
        <DaybookForm
          initialData={initialData}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
