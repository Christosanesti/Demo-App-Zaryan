"use client";

import { Customer } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CustomerListProps {
  customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">
          No customers found. Create your first customer!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer, index) => (
        <motion.div
          key={customer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-700/50">
                  {customer.photoUrl ?
                    <Image
                      src={customer.photoUrl}
                      alt={customer.name}
                      fill
                      className="object-cover"
                    />
                  : <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                  }
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-200">
                    {customer.name}
                  </h3>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
