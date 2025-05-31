import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDaybook } from "@/hooks/use-daybook";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface DaybookTableProps {
  entries: any[];
  isLoading: boolean;
}

export function DaybookTable({ entries, isLoading }: DaybookTableProps) {
  const { deleteEntry, isDeleting } = useDaybook();
  const { userId } = useAuth();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/daybook/${id}/edit`);
  };

  const handleReferenceClick = (referenceId: string) => {
    router.push(`/ledgers/${referenceId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.date), "PPP")}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.type === "income" ?
                        "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                  >
                    {entry.type === "income" ? "Income" : "Expense"}
                  </span>
                </TableCell>
                <TableCell
                  className={
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => handleReferenceClick(entry.reference)}
                  >
                    {entry.reference}
                  </Button>
                </TableCell>
                <TableCell>{entry.category}</TableCell>
                <TableCell className="capitalize">
                  {entry.paymentMethod}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.status === "completed" ?
                        "bg-green-100 text-green-800"
                      : entry.status === "pending" ?
                        "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    }`}
                  >
                    {entry.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(entry.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the daybook entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(entry.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
