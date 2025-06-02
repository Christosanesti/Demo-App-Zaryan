import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["individual", "company"]),
  status: z.enum(["active", "inactive"]),
  guarantorName: z.string().optional(),
  guarantorPhone: z.string().optional(),
  guarantorAddress: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  onSubmit: (values: FormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CustomerForm({
  onSubmit,
  isSubmitting,
  onCancel,
}: CustomerFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      type: "individual",
      status: "active",
      guarantorName: "",
      guarantorPhone: "",
      guarantorAddress: "",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Customer Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-800/50 border-slate-600/50"
                    placeholder="Enter customer name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-800/50 border-slate-600/50"
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="bg-slate-800/50 border-slate-600/50"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Address
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-800/50 border-slate-600/50 resize-none"
                    placeholder="Enter address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-800/50 border-slate-600/50 resize-none"
                    placeholder="Enter any additional notes"
                    {...field}
                  />
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
                <FormLabel className="text-slate-300 font-medium">
                  Customer Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200">
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem
                      value="individual"
                      className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                    >
                      Individual
                    </SelectItem>
                    <SelectItem
                      value="company"
                      className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                    >
                      Company
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 font-medium">
                  Status
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem
                      value="active"
                      className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                    >
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
