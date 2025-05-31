"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserSettings } from "@/generated/prisma";
import {
  Loader2,
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  Briefcase,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  position: string;
  department: string;
  joinDate: string;
  salary?: string;
  notes?: string;
  status: "active" | "inactive";
}

interface StaffTotals {
  totalStaff: number;
  byStatus: {
    active: number;
    inactive: number;
  };
  byDepartment: Record<string, number>;
  averageSalary: number;
}

interface StaffResponse {
  staff: Staff[];
  totals: StaffTotals;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  joinDate: z.string().min(1, "Join date is required"),
  salary: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffClientProps {
  userSettings: {
    currency: string;
  } | null;
}

type SortField = "name" | "department" | "position" | "joinDate" | "salary";
type SortOrder = "asc" | "desc";

const StaffClient = ({ userSettings }: StaffClientProps) => {
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    status: "all",
  });
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "name",
    order: "asc",
  });
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      joinDate: "",
      salary: "",
      notes: "",
      status: "active",
    },
  });

  const { data, isLoading, error } = useQuery<StaffResponse>({
    queryKey: ["staff", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.department && filters.department !== "all")
        params.append("department", filters.department);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);

      const response = await fetch(`/api/staff?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch staff");
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create staff member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      form.reset();
      setIsEditDialogOpen(false);
      toast.success("Staff member added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add staff member");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!selectedStaff) throw new Error("No staff member selected");
      const response = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedStaff.id, ...values }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update staff member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditDialogOpen(false);
      toast.success("Staff member updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update staff member");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const responses = await Promise.all(
        ids.map((id) =>
          fetch(`/api/staff?id=${id}`, {
            method: "DELETE",
          })
        )
      );
      const errors = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            return error.message;
          }
          return null;
        })
      );
      const errorMessages = errors.filter(Boolean);
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join(", "));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setSelectedStaffIds([]);
      toast.success("Selected staff members deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete staff members");
    },
  });

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  const sortedStaff = useMemo(() => {
    if (!data?.staff) return [];
    return [...data.staff].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (sortConfig.field === "salary") {
        const aNum = parseFloat(aValue || "0");
        const bNum = parseFloat(bValue || "0");
        return sortConfig.order === "asc" ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.field === "joinDate") {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.order === "asc" ? aDate - bDate : bDate - aDate;
      }

      const comparison = String(aValue || "").localeCompare(
        String(bValue || "")
      );
      return sortConfig.order === "asc" ? comparison : -comparison;
    });
  }, [data?.staff, sortConfig]);

  const handleStaffSelection = useCallback(
    (staffId: string, event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      setSelectedStaffIds((prev) =>
        prev.includes(staffId) ?
          prev.filter((id) => id !== staffId)
        : [...prev, staffId]
      );
    },
    []
  );

  const handleEdit = useCallback(
    (staff: Staff, event: React.MouseEvent) => {
      event.stopPropagation();
      setSelectedStaff(staff);
      form.reset({
        name: staff.name,
        email: staff.email || "",
        phone: staff.phone || "",
        address: staff.address || "",
        position: staff.position,
        department: staff.department,
        joinDate: staff.joinDate,
        salary: staff.salary || "",
        notes: staff.notes || "",
        status: staff.status,
      });
      setIsEditDialogOpen(true);
    },
    [form]
  );

  const handleDelete = useCallback(
    (staffId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const confirmed = window.confirm(
        "Are you sure you want to delete this staff member?"
      );
      if (confirmed) {
        deleteMutation.mutate([staffId]);
      }
    },
    [deleteMutation]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedStaffIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedStaffIds.length} staff member(s)?`
    );

    if (confirmed) {
      deleteMutation.mutate(selectedStaffIds);
    }
  }, [selectedStaffIds, deleteMutation]);

  const handleExport = useCallback(() => {
    if (!data?.staff) return;

    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Position",
        "Department",
        "Status",
        "Join Date",
        "Salary",
        "Address",
        "Notes",
      ].join(","),
      ...data.staff.map((staff: any) =>
        [
          staff.name,
          staff.email || "",
          staff.phone || "",
          staff.position,
          staff.department,
          staff.status,
          staff.joinDate,
          staff.salary || "",
          staff.address || "",
          staff.notes || "",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `staff_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data?.staff]);

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text
            .split("\n")
            .map((row) =>
              row.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
            );
          const headers = rows[0];
          const data = rows.slice(1);

          const staffData = data.map((row) => ({
            name: row[0],
            email: row[1],
            phone: row[2],
            position: row[3],
            department: row[4],
            status: row[5],
            joinDate: row[6],
            salary: row[7],
            address: row[8],
            notes: row[9],
          }));

          const batchSize = 5;
          for (let i = 0; i < staffData.length; i += batchSize) {
            const batch = staffData.slice(i, i + batchSize);
            await Promise.all(
              batch.map((staff) =>
                fetch("/api/staff", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(staff),
                })
              )
            );
          }

          queryClient.invalidateQueries({ queryKey: ["staff"] });
          toast.success("Staff members imported successfully");
        } catch (error) {
          toast.error("Failed to import staff members");
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    },
    [queryClient]
  );

  const handleAddNew = useCallback(() => {
    setSelectedStaff(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      joinDate: "",
      salary: "",
      notes: "",
      status: "active",
    });
    setIsEditDialogOpen(true);
  }, [form]);

  const toggleStaffExpansion = useCallback((staffId: string) => {
    setExpandedStaff((prev) => (prev === staffId ? null : staffId));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      department: "all",
      status: "all",
    });
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const onSubmit = useCallback(
    (values: FormValues) => {
      if (selectedStaff) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    },
    [selectedStaff, updateMutation, createMutation]
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">
            Error Loading Staff Data
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ?
              error.message
            : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totals?.totalStaff || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totals?.byStatus?.active || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(data?.totals?.byDepartment || {}).length}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Salary
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userSettings?.currency}{" "}
              {data?.totals?.averageSalary?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Staff List</CardTitle>
            <div className="flex items-center gap-2">
              {selectedStaffIds.length > 0 && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete Selected ({selectedStaffIds.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStaffIds([])}
                  >
                    Clear Selection
                  </Button>
                </>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                  id="import-staff"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("import-staff")?.click()
                  }
                >
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  Export CSV
                </Button>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedStaff ?
                        "Edit Staff Member"
                      : "Add New Staff Member"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
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
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="management">
                                    Management
                                  </SelectItem>
                                  <SelectItem value="sales">Sales</SelectItem>
                                  <SelectItem value="operations">
                                    Operations
                                  </SelectItem>
                                  <SelectItem value="it">IT</SelectItem>
                                  <SelectItem value="hr">HR</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="joinDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Join Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            createMutation.isPending || updateMutation.isPending
                          }
                        >
                          {(createMutation.isPending ||
                            updateMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {selectedStaff ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search staff..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-[200px]"
                  />
                  <Select
                    value={filters.department}
                    onValueChange={(value) =>
                      handleFilterChange("department", value)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFilters}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <Separator className="my-4" />
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("name")}
                className="flex items-center gap-1"
              >
                Name
                {sortConfig.field === "name" &&
                  (sortConfig.order === "asc" ?
                    <SortAsc className="h-4 w-4" />
                  : <SortDesc className="h-4 w-4" />)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("department")}
                className="flex items-center gap-1"
              >
                Department
                {sortConfig.field === "department" &&
                  (sortConfig.order === "asc" ?
                    <SortAsc className="h-4 w-4" />
                  : <SortDesc className="h-4 w-4" />)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("position")}
                className="flex items-center gap-1"
              >
                Position
                {sortConfig.field === "position" &&
                  (sortConfig.order === "asc" ?
                    <SortAsc className="h-4 w-4" />
                  : <SortDesc className="h-4 w-4" />)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("joinDate")}
                className="flex items-center gap-1"
              >
                Join Date
                {sortConfig.field === "joinDate" &&
                  (sortConfig.order === "asc" ?
                    <SortAsc className="h-4 w-4" />
                  : <SortDesc className="h-4 w-4" />)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("salary")}
                className="flex items-center gap-1"
              >
                Salary
                {sortConfig.field === "salary" &&
                  (sortConfig.order === "asc" ?
                    <SortAsc className="h-4 w-4" />
                  : <SortDesc className="h-4 w-4" />)}
              </Button>
            </div>
            <ScrollArea className="h-[600px] pr-4">
              {isLoading ?
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              : <div className="space-y-4">
                  {sortedStaff.map((staff: any) => (
                    <div
                      key={staff.id}
                      className={`rounded-lg border p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                        selectedStaffIds.includes(staff.id) ? "border-primary"
                        : ""
                      }`}
                      onClick={(e) => handleStaffSelection(staff.id, e)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{staff.name}</h3>
                            <Badge
                              variant={
                                staff.status === "active" ?
                                  "default"
                                : "secondary"
                              }
                            >
                              {staff.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {staff.position}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {staff.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(staff.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Collapsible open={expandedStaff === staff.id}>
                            <CollapsibleContent className="mt-2 space-y-2">
                              {staff.email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-4 w-4" />
                                  {staff.email}
                                </div>
                              )}
                              {staff.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-4 w-4" />
                                  {staff.phone}
                                </div>
                              )}
                              {staff.address && (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-4 w-4" />
                                  {staff.address}
                                </div>
                              )}
                              {staff.salary && (
                                <div className="flex items-center gap-1 text-sm">
                                  <DollarSign className="h-4 w-4" />
                                  {staff.salary}
                                </div>
                              )}
                              {staff.notes && (
                                <div className="flex items-center gap-1 text-sm">
                                  <FileText className="h-4 w-4" />
                                  {staff.notes}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStaffExpansion(staff.id);
                            }}
                          >
                            {expandedStaff === staff.id ?
                              <ChevronUp className="h-4 w-4" />
                            : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEdit(staff, e)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Staff Member</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleDelete(staff.id, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Staff Member</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Staff Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="departments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>
              <TabsContent value="departments" className="space-y-4">
                {Object.entries(data?.totals?.byDepartment || {}).map(
                  ([department, count]) => (
                    <div
                      key={department}
                      className="flex items-center justify-between transition-opacity duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{department}</span>
                      </div>
                      <Badge variant="outline">{String(count)}</Badge>
                    </div>
                  )
                )}
              </TabsContent>
              <TabsContent value="status" className="space-y-4">
                {Object.entries(data?.totals?.byStatus || {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between transition-opacity duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{status}</span>
                      </div>
                      <Badge
                        variant={
                          status === "active" ? "default" : "destructive"
                        }
                      >
                        {String(count)}
                      </Badge>
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffClient;
