"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Clock, DollarSign, Package, Users } from "lucide-react";
import { toast } from "sonner";

const historyData = [
  {
    id: 1,
    type: "sale",
    amount: 1234.56,
    description: "New sale completed",
    date: "2024-03-15 14:30",
    status: "completed",
    icon: DollarSign,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    id: 2,
    type: "inventory",
    amount: 500,
    description: "Inventory updated",
    date: "2024-03-15 13:15",
    status: "processing",
    icon: Package,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    id: 3,
    type: "customer",
    amount: 0,
    description: "New customer registered",
    date: "2024-03-15 12:00",
    status: "completed",
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    id: 4,
    type: "sale",
    amount: 2345.67,
    description: "Sale refunded",
    date: "2024-03-15 11:45",
    status: "refunded",
    icon: DollarSign,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  {
    id: 5,
    type: "inventory",
    amount: 750,
    description: "Stock level adjusted",
    date: "2024-03-15 10:30",
    status: "completed",
    icon: Package,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
];

export default function History() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-300">
              Recent History
            </CardTitle>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Last 24 hours</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {historyData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300">
                    <div
                      className={`p-2 rounded-lg ${item.bgColor} group-hover:bg-opacity-30 transition-colors duration-300`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-200 truncate">
                          {item.description}
                        </p>
                        {item.amount > 0 && (
                          <span className="text-sm font-medium text-slate-300">
                            ${item.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {item.date}
                        </span>
                        <Badge
                          variant={
                            item.status === "completed" ? "success"
                            : item.status === "processing" ?
                              "warning"
                            : "destructive"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toast.success("Viewing transaction details")
                      }
                      className="p-1 rounded-full hover:bg-slate-600/50 transition-colors duration-300"
                    >
                      <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
