"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LedgerEntryForm } from "../ledgers/_components/LedgerEntryForm";

interface Props {
  type: TransactionType;
  value?: string;
  onChange?: (value: string) => void;
}

const REFERENCE_OPTIONS = [
  { value: "ledger", label: "Ledger" },
  { value: "bank", label: "Bank" },
  { value: "customer", label: "Customer" },
];

const DEFAULT_LEDGERS = [
  { id: "1", name: "Main Ledger" },
  { id: "2", name: "Expense Ledger" },
  { id: "3", name: "Income Ledger" },
];

function CategoryPicker({ type, value, onChange }: Props) {
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [reference, setReference] = useState(value || "");
  const [selectedLedger, setSelectedLedger] = useState("");
  const [showLedgerForm, setShowLedgerForm] = useState(false);

  const handleReferenceChange = (newValue: string) => {
    setReference(newValue);
    onChange?.(newValue);
    setReferenceOpen(false);
    if (newValue === "ledger") {
      setLedgerOpen(true);
    }
  };

  const handleLedgerSelect = (ledgerName: string) => {
    setSelectedLedger(ledgerName);
    onChange?.(ledgerName);
    setLedgerOpen(false);
  };

  return (
    <div className="space-y-4">
      <Popover open={referenceOpen} onOpenChange={setReferenceOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-full justify-between"
            variant={"outline"}
            role="combobox"
          >
            {reference || "Select Reference Type"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {REFERENCE_OPTIONS.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleReferenceChange}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {reference === "ledger" && (
        <Popover open={ledgerOpen} onOpenChange={setLedgerOpen}>
          <PopoverTrigger asChild>
            <Button
              className="w-full justify-between"
              variant={"outline"}
              role="combobox"
            >
              {selectedLedger || "Select Ledger"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {DEFAULT_LEDGERS.map((ledger) => (
                    <CommandItem
                      key={ledger.id}
                      value={ledger.name}
                      onSelect={handleLedgerSelect}
                    >
                      {ledger.name}
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="add-custom"
                    onSelect={() => {
                      setShowLedgerForm(true);
                      setLedgerOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Custom Ledger</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      <LedgerEntryForm
        open={showLedgerForm}
        onClose={() => setShowLedgerForm(false)}
        selectedType="CUSTOM"
      />
    </div>
  );
}

export default CategoryPicker;
