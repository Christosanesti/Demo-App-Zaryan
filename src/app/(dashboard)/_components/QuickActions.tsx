"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Building2,
  FileText,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const actions = [
  {
    title: "New Sale",
    description: "Create a new sale transaction",
    icon: Wallet,
    href: "/sales/new",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Add Customer",
    description: "Register a new customer",
    icon: Users,
    href: "/customers/new",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
  },
  {
    title: "Add Inventory",
    description: "Add new items to inventory",
    icon: Package,
    href: "/inventory/new",
    color: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-400",
  },
  {
    title: "New Invoice",
    description: "Create a new invoice",
    icon: FileText,
    href: "/invoices/new",
    color: "from-orange-500/20 to-orange-600/20",
    iconColor: "text-orange-400",
  },
  {
    title: "Daybook",
    description: "View daily transactions",
    icon: BookOpen,
    href: "/daybook",
    color: "from-pink-500/20 to-pink-600/20",
    iconColor: "text-pink-400",
  },
  {
    title: "Company",
    description: "Manage company details",
    icon: Building2,
    href: "/company",
    color: "from-indigo-500/20 to-indigo-600/20",
    iconColor: "text-indigo-400",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="group"
        >
          <Button
            variant="ghost"
            className={`w-full h-auto p-4 bg-gradient-to-br ${action.color} border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300`}
            onClick={() => {
              router.push(action.href);
              toast.success(`Navigating to ${action.title}`);
            }}
          >
            <div className="flex items-start space-x-4 w-full">
              <div
                className={`p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors duration-300`}
              >
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {action.description}
                </p>
              </div>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
