import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function InventoryStats() {
  // Placeholder for loading and stats data
  // Replace with TenStack Query logic
  const isLoading = false;
  const stats = [
    { label: "Total Items", value: 120 },
    { label: "Low Stock", value: 8 },
    { label: "Categories", value: 5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {isLoading ?
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))
      : stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-primary/80 via-fuchsia-500/80 to-cyan-400/80 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              {stat.value}
            </span>
            <span className="text-white/80 text-lg mt-2 font-medium">
              {stat.label}
            </span>
          </div>
        ))
      }
    </motion.div>
  );
}
