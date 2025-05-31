"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Calendar,
  DollarSign,
  Hash,
  Tag,
  CreditCard,
  User,
  Clock,
  Edit,
  Trash2,
  Download,
  Share,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Wallet,
  Receipt,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  type: string;
  customType?: string;
  title: string;
  description?: string;
  amount: number;
  transactionType: "CREDIT" | "DEBIT";
  date: string;
  reference?: string;
  category?: string;
  paymentMethod?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface LedgerEntryDetailsProps {
  open: boolean;
  onClose: () => void;
  entry: LedgerEntry | null;
  onEdit?: (entry: LedgerEntry) => void;
  onDelete?: (entry: LedgerEntry) => void;
}

const LEDGER_TYPE_CONFIGS = {
  BANK: {
    icon: Building2,
    color: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-600/10",
    emoji: "🏦",
  },
  EXPENSE: {
    icon: Receipt,
    color: "from-red-500 to-orange-600",
    bgGradient: "from-red-500/10 to-orange-600/10",
    emoji: "💸",
  },
  SALARY: {
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bgGradient: "from-green-500/10 to-emerald-600/10",
    emoji: "💰",
  },
  PURCHASE: {
    icon: Receipt,
    color: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-500/10 to-indigo-600/10",
    emoji: "🛒",
  },
  SALE: {
    icon: ArrowUpRight,
    color: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
    emoji: "💹",
  },
  CUSTOMER: {
    icon: User,
    color: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
    emoji: "👥",
  },
  CUSTOM: {
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
    emoji: "⚙️",
  },
};

export function LedgerEntryDetails({
  open,
  onClose,
  entry,
  onEdit,
  onDelete,
}: LedgerEntryDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entry) return null;

  const typeConfig =
    LEDGER_TYPE_CONFIGS[entry.type as keyof typeof LEDGER_TYPE_CONFIGS] ||
    LEDGER_TYPE_CONFIGS.CUSTOM;
  const TypeIcon = typeConfig.icon;
  const TransactionIcon =
    entry.transactionType === "CREDIT" ? ArrowDownRight : ArrowUpRight;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTransactionColor = (type: string) => {
    return type === "CREDIT" ? "text-green-400" : "text-red-400";
  };

  const getTransactionBg = (type: string) => {
    return type === "CREDIT" ? "bg-green-500/10" : "bg-red-500/10";
  };

  const getTransactionBorder = (type: string) => {
    return type === "CREDIT" ? "border-green-500/30" : "border-red-500/30";
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(entry);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExport = () => {
    const exportData = {
      ...entry,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-entry-${entry.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ledger Entry: ${entry.title}`,
          text: `${entry.transactionType} of ${formatCurrency(entry.amount)} - ${entry.description || "No description"}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share was cancelled or failed");
      }
    } else {
      // Fallback: Copy to clipboard
      const shareText = `Ledger Entry: ${entry.title}\n${entry.transactionType}: ${formatCurrency(entry.amount)}\nDate: ${format(new Date(entry.date), "PPP")}\n${entry.description || ""}`;
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color} shadow-lg`}
            >
              <TypeIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span>{typeConfig.emoji}</span>
                <span>{entry.title}</span>
              </div>
              <div className="text-sm text-slate-400 font-normal">
                Entry ID: {entry.id}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Transaction Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Transaction Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Amount */}
                    <div
                      className={`p-4 rounded-lg border ${getTransactionBorder(entry.transactionType)} ${getTransactionBg(entry.transactionType)}`}
                    >
                      <div className="flex items-center gap-3">
                        <TransactionIcon
                          className={`h-6 w-6 ${getTransactionColor(entry.transactionType)}`}
                        />
                        <div>
                          <div className="text-sm text-slate-400">Amount</div>
                          <div
                            className={`text-2xl font-bold ${getTransactionColor(entry.transactionType)}`}
                          >
                            {entry.transactionType === "DEBIT" ? "-" : "+"}
                            {formatCurrency(entry.amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="h-6 w-6 text-slate-400" />
                        <div>
                          <div className="text-sm text-slate-400">Type</div>
                          <div className="text-lg font-semibold text-slate-200">
                            {entry.customType || entry.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-slate-400" />
                        <div>
                          <div className="text-sm text-slate-400">Date</div>
                          <div className="text-lg font-semibold text-slate-200">
                            {format(new Date(entry.date), "PPP")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Entry Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  {entry.description && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Description
                      </h4>
                      <p className="text-slate-400 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        {entry.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reference */}
                    {entry.reference && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm text-slate-400">
                            Reference
                          </div>
                          <div className="text-slate-200 font-medium">
                            {entry.reference}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {entry.category && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm text-slate-400">Category</div>
                          <div className="text-slate-200 font-medium">
                            {entry.category}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    {entry.paymentMethod && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                        <Wallet className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm text-slate-400">
                            Payment Method
                          </div>
                          <div className="text-slate-200 font-medium">
                            {entry.paymentMethod}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Type */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-400">
                          Transaction Type
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getTransactionBorder(entry.transactionType)} ${getTransactionColor(entry.transactionType)}`}
                        >
                          {entry.transactionType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-slate-700 text-slate-200 border-slate-600"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-slate-400">Created</div>
                        <div className="text-slate-200">
                          {format(new Date(entry.createdAt), "PPpp")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-slate-400">Last Updated</div>
                        <div className="text-slate-200">
                          {format(new Date(entry.updatedAt), "PPpp")}
                        </div>
                      </div>
                    </div>

                    {entry.user && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700 md:col-span-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-slate-400">Created by</div>
                          <div className="text-slate-200">
                            {entry.user.name} ({entry.user.email})
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>

        <Separator className="bg-slate-700" />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
