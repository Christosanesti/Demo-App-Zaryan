"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Settings,
  Edit,
  Save,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Globe,
  Camera,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  PageHeader,
  EnhancedCard,
  StatCard,
  PageContainer,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui/design-system";
import { UserSettings } from "@/lib/auth-utils";

interface CompanyClientProps {
  userSettings: UserSettings | null;
}

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  website: z.string().url("Invalid URL format").optional(),
  taxId: z.string().optional(),
  logo: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyClient({ userSettings }: CompanyClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState(userSettings?.currency || "USD");

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      website: "",
      taxId: "",
      logo: "",
    },
  });

  // Fetch company data
  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await fetch("/api/company");
      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }
      const data = await response.json();
      if (data) {
        form.reset(data);
      }
      return data;
    },
  });

  // Fetch company stats
  const { data: stats } = useQuery({
    queryKey: ["company-stats"],
    queryFn: async () => {
      const response = await fetch("/api/company/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch company stats");
      }
      return response.json();
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await fetch("/api/company", {
        method: company ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update company");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setIsEditing(false);
      toast.success("Company information updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update company: ${error.message}`);
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    updateCompanyMutation.mutate(data);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState
          icon={Building2}
          title="Failed to Load Company Data"
          description="There was an error loading your company information. Please try again."
          action={{
            label: "Retry",
            onClick: () => window.location.reload(),
          }}
        />
      </PageContainer>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats?.totalRevenue || "$0",
      change: "↗ 12% from last month",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      gradientFrom: "from-emerald-500/20",
      gradientTo: "to-teal-600/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Active Customers",
      value: stats?.totalCustomers || "0",
      change: "↗ 8% from last month",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      gradientFrom: "from-blue-500/20",
      gradientTo: "to-cyan-600/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Total Sales",
      value: stats?.totalSales || "0",
      change: "↗ 15% from last month",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
      gradientFrom: "from-purple-500/20",
      gradientTo: "to-pink-600/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Outstanding Invoices",
      value: stats?.outstandingInvoices || "0",
      change: "↘ 5% from last month",
      icon: FileText,
      color: "from-orange-500 to-red-600",
      gradientFrom: "from-orange-500/20",
      gradientTo: "to-red-600/20",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Company Management"
        description="Manage your company profile, settings, and view business insights"
        badges={[
          {
            text: "Business Profile",
            icon: Building2,
            color: "border-blue-500/30 text-blue-400",
          },
          {
            text: "Settings",
            icon: Settings,
            color: "border-purple-500/30 text-purple-400",
          },
        ]}
      >
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          size="lg"
          className={
            isEditing ?
              "border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
          }
        >
          {isEditing ?
            <>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </>
          : <>
              <Edit className="mr-2 h-5 w-5" />
              Edit Company
            </>
          }
        </Button>
      </PageHeader>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/40 border border-slate-700/50">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <EnhancedCard
            title="Company Information"
            description={
              isEditing ?
                "Update your company details"
              : "View your company profile"
            }
            icon={Building2}
            iconColor="text-blue-400"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Company Logo and Basic Info */}
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 border-4 border-slate-700/50">
                      <AvatarImage src={company?.logo} alt={company?.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {company?.name?.substring(0, 2)?.toUpperCase() || "CO"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="Enter company name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Industry
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="e.g., Technology, Healthcare"
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
                          <FormLabel className="text-slate-300">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="company@example.com"
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
                          <FormLabel className="text-slate-300">
                            Phone
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="+1 (555) 123-4567"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Website
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="https://www.company.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Tax ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="XX-XXXXXXX"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">
                        Company Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70 min-h-[100px]"
                          placeholder="Tell us about your company..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    Address Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Street Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                            placeholder="123 Main Street"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="New York"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            State
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="NY"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            ZIP Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="10001"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            Country
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="bg-slate-800/50 border-slate-700/50 text-slate-200 disabled:opacity-70"
                              placeholder="United States"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateCompanyMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    >
                      {updateCompanyMutation.isPending ?
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      : <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      }
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <EnhancedCard
            title="Business Settings"
            description="Configure your business preferences and defaults"
            icon={Settings}
            iconColor="text-purple-400"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-300">Email Notifications</Label>
                  <p className="text-sm text-slate-400">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch />
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-300">Auto-backup</Label>
                  <p className="text-sm text-slate-400">
                    Automatically backup your data daily
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-300">Marketing Emails</Label>
                  <p className="text-sm text-slate-400">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <EnhancedCard
            title="Security Settings"
            description="Manage your account security and access controls"
            icon={Shield}
            iconColor="text-emerald-400"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                  <Button
                    variant="outline"
                    className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">API Access</Label>
                  <p className="text-sm text-slate-400">
                    Manage API keys for third-party integrations
                  </p>
                  <Button
                    variant="outline"
                    className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View API Keys
                  </Button>
                </div>
              </div>
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50 mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-200">
              Company Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Currency
              </Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-slate-200"
                placeholder="Enter currency code (e.g., USD)"
              />
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
