"use client";
import React from "react";
import { motion } from "framer-motion";
import { UserButtonWrapper } from "@/components/auth/UserButtonWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Plus,
  Package,
  BarChart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function DashboardPage() {
  const handleCreate = (type: string) => {
    toast.success(`${type} created successfully!`);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6"
    >
      {/* Header Section */}
      <motion.div
        className="dashboard-header flex justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Welcome back to your dashboard</p>
        </div>
        <UserButtonWrapper />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="stat-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$45,231.89</div>
              <p className="text-xs text-slate-400 mt-1">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="stat-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2,350</div>
              <p className="text-xs text-slate-400 mt-1">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="stat-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Sales
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12,234</div>
              <p className="text-xs text-slate-400 mt-1">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="stat-card"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+573</div>
              <p className="text-xs text-slate-400 mt-1">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          className="chart-container lg:col-span-2"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-300">
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[300px] bg-slate-700/50" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="recent-activity"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-300">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <motion.div
                    key={item}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item * 0.1 }}
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        New user registered
                      </p>
                      <p className="text-xs text-slate-400">2 minutes ago</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-400"
                      onClick={() => toast.success("Activity details opened")}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="action-card"
            >
              <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    New Sale
                  </CardTitle>
                  <Plus className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">
                    Create a new sale record
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Sale</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the details for the new sale.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer" className="text-slate-400">
                  Customer
                </Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="customer1">Customer 1</SelectItem>
                    <SelectItem value="customer2">Customer 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-slate-400">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-slate-400">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Add any additional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate("Sale")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create Sale
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="action-card"
            >
              <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Add Customer
                  </CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">
                    Add a new customer to the system
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Customer</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the customer's information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-400">
                  Name
                </Label>
                <Input
                  id="name"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-400">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-slate-400">
                  Phone
                </Label>
                <Input
                  id="phone"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate("Customer")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="action-card"
            >
              <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Add Inventory
                  </CardTitle>
                  <Package className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">
                    Add new items to inventory
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-white">
                Add New Inventory Item
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the item details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="itemName" className="text-slate-400">
                  Item Name
                </Label>
                <Input
                  id="itemName"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter item name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-slate-400">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-slate-400">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  className="bg-slate-700/50 border-slate-600/50"
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate("Inventory Item")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="action-card"
            >
              <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Generate Report
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">
                    Generate a new report
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-white">Generate Report</DialogTitle>
              <DialogDescription className="text-slate-400">
                Select report parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reportType" className="text-slate-400">
                  Report Type
                </Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="customers">Customer Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateRange" className="text-slate-400">
                  Date Range
                </Label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreate("Report")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Generate Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
