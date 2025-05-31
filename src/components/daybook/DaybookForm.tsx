import { useDaybook } from "@/hooks/useDaybook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(["income", "expense"], {
    required_error: "Please select a type",
  }),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface DaybookFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    date: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    reference: string;
  };
}

export function DaybookForm({ onSuccess, initialData }: DaybookFormProps) {
  const { createEntry, updateEntry } = useDaybook();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      initialData ?
        {
          date: initialData.date,
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          reference: initialData.reference,
        }
      : {
          date: new Date().toISOString().split("T")[0],
          type: "income",
          amount: "",
          description: "",
          reference: "",
        },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        ...values,
        amount: parseFloat(values.amount),
      };

      if (initialData) {
        await updateEntry.mutateAsync({
          id: initialData.id,
          data,
        });
        toast.success("Entry updated successfully");
      } else {
        await createEntry.mutateAsync(data);
        toast.success("Entry created successfully");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save entry");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="Enter reference" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ?
              "Saving..."
            : initialData ?
              "Update Entry"
            : "Add Entry"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
