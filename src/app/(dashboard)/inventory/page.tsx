"use client";
import { Suspense } from "react";
import { InventoryStats } from "./_components/InventoryStats";
import { InventoryTable } from "./_components/InventoryTable";
import CategoryOverview from "./_components/CategoryOverview";
import { InventoryPurchase } from "./_components/InventoryPurchase";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-10 space-y-12 relative">
      {/* Animated Main Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-primary to-cyan-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
          Inventory Management
        </h1>
        <p className="text-muted-foreground/90 text-lg md:text-xl">
          Track, manage, and analyze your stock and purchases in one place.
        </p>
      </motion.div>

      {/* Floating Add Item Button */}
      <Link
        href="#add-item"
        className="fixed z-30 bottom-8 right-8 md:bottom-12 md:right-12 bg-gradient-to-br from-primary via-fuchsia-500 to-cyan-400 text-white rounded-full shadow-xl p-4 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
        aria-label="Quick Add Item"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden md:inline font-semibold">Add Item</span>
      </Link>

      {/* Inventory Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
          Overview
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 rounded-full mb-2" />
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
          <InventoryStats />
        </Suspense>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Inventory Table Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Inventory Items
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 rounded-full mb-2" />
            <Suspense
              fallback={<Skeleton className="h-96 w-full rounded-xl" />}
            >
              <InventoryTable
                items={[]}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </Suspense>
          </motion.section>

          {/* Inventory Purchase Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
            id="add-item"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Purchases
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 rounded-full mb-2" />
            <Suspense
              fallback={<Skeleton className="h-96 w-full rounded-xl" />}
            >
              <InventoryPurchase />
            </Suspense>
          </motion.section>
        </div>
        {/* Sidebar: Category Overview */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            Categories
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 rounded-full mb-2" />
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <CategoryOverview />
          </Suspense>
        </motion.section>
      </div>
    </div>
  );
}
