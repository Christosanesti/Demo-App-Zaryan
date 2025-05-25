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
  const [customLedgerName, setCustomLedgerName] = useState("");
  const [showCustomLedgerDialog, setShowCustomLedgerDialog] = useState(false);

  const handleAddCustomLedger = () => {
    if (customLedgerName.trim()) {
      // Here you would typically make an API call to save the new ledger
      DEFAULT_LEDGERS.push({
        id: Date.now().toString(),
        name: customLedgerName,
      });
      setSelectedLedger(customLedgerName);
      onChange?.(customLedgerName);
      setCustomLedgerName("");
      setShowCustomLedgerDialog(false);
      setLedgerOpen(false);
    }
  };

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
    <div className="flex flex-col gap-2">
      <Popover open={referenceOpen} onOpenChange={setReferenceOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-full justify-between"
            variant={"outline"}
            role="combobox"
          >
            {reference ?
              REFERENCE_OPTIONS.find((ref) => ref.value === reference)?.label
            : "Select Reference"}
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
                      setShowCustomLedgerDialog(true);
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

      <Dialog
        open={showCustomLedgerDialog}
        onOpenChange={setShowCustomLedgerDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Ledger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ledger-name">Ledger Name</Label>
              <Input
                id="ledger-name"
                value={customLedgerName}
                onChange={(e) => setCustomLedgerName(e.target.value)}
                placeholder="Enter ledger name"
              />
            </div>
            <Button onClick={handleAddCustomLedger} className="w-full">
              Add Ledger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoryPicker;
