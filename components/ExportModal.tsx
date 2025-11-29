"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Checkbox } from "@/components/ui/checkbox";
import { RiShare2Fill } from "react-icons/ri";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpointPrefix: string; // e.g., "vnuban", "users"
  fieldOptions: { label: string; value: string }[];
  dataName: string; // New prop to specify the name (e.g., "Orders", "Products")
}

export function ExportModal({ isOpen, onClose, endpointPrefix, fieldOptions, dataName = "Dashboard" }: ExportModalProps) {
  const [dateRangeFrom, setDateRangeFrom] = useState<Date | undefined>(new Date());
  const [dateRangeTo, setDateRangeTo] = useState<Date | undefined>(new Date());
  const [format, setFormat] = useState("CSV");
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

  // Check if all fields are selected
  const allSelected = fieldOptions.length > 0 && fieldOptions.every((field) => selectedFields[field.value] === true);

  const handleExport = async () => {
    const startDate = dateRangeFrom ? dateRangeFrom.toISOString().split("T")[0] : "";
    const endDate = dateRangeTo ? dateRangeTo.toISOString().split("T")[0] : "";
  
    // Validate date range
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
  
    const selectedFieldValues = Object.entries(selectedFields)
      .filter(([, isSelected]) => isSelected)
      .map(([value]) => value);
    
    const fieldsParam = selectedFieldValues.length > 0 ? `&fields=${encodeURIComponent(selectedFieldValues.join(","))}` : "";
  
    // Determine the endpoint based on dataName
    let endpoint = "";
    if (dataName.toLowerCase().includes("product")) {
      endpoint = "products";
    } else if (dataName.toLowerCase().includes("order")) {
      endpoint = "orders";
    } else {
      // Default to dashboard data (you might want to create a separate endpoint for this)
      endpoint = "dashboard";
    }
  
    const apiUrl = `/api/exports/${endpoint}?format=${format.toLowerCase()}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}${fieldsParam}`;
  
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to export data");
      }
  
      const blob = await response.blob();
      const filename =
        response.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ||
        `${endpoint}_export_${startDate}_to_${endDate}.${format.toLowerCase()}`;
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  
      toast.success(`Exported ${filename} successfully`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export data: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  // Handle checkbox change
  const handleFieldChange = (value: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  // Reset date selections
  const handleResetDates = () => {
    setDateRangeFrom(undefined);
    setDateRangeTo(undefined);
  };

  // Toggle select all or clear selections
  const handleToggleSelections = () => {
    if (allSelected) {
      setSelectedFields({});
    } else {
      const newSelectedFields = Object.fromEntries(fieldOptions.map((field) => [field.value, true]));
      setSelectedFields(newSelectedFields);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <VisuallyHidden>
        <DialogTitle>Export Modal</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="max-w-[95vw] w-full mx-auto rounded-lg">
        <DialogHeader className="border-b pb-4">
          <h3 className="text-sm font-semibold">Export {dataName} Data</h3>
          <p className="text-xs font-light text-gray-400 dark:text-gray-100">
            Select the data you&apos;d like to export and the format
          </p>
        </DialogHeader>
        <div className="space-y-6 p-1">
          {/* Date Range */}
          <div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-light mb-2 text-gray-500">Date Range</p>
              <Button variant="ghost" onClick={handleResetDates} className="text-xs text-[#4FCA6A]">
                Reset
              </Button>
            </div>
            <div className="flex items-center text-xs gap-2">
              <DatePicker id="from-date" date={dateRangeFrom} onSelect={setDateRangeFrom} placeholder="Select date" label="From:" />
              <DatePicker id="to-date" date={dateRangeTo} onSelect={setDateRangeTo} placeholder="Select date" label="To:" />
            </div>
          </div>

          {/* Field Options */}
          <div>
            <div className="flex justify-between items-center">
              <p className="text-2xs text-xs font-light mb-2 text-gray-500">Fields to Export</p>
              <Button variant="ghost" onClick={handleToggleSelections} className="text-xs sm:text-xs text-[#4FCA6A]">
                {allSelected ? "Clear Selections" : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {fieldOptions.map((field) => (
                <div key={field.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.value}
                    checked={selectedFields[field.value] || false}
                    onCheckedChange={() => handleFieldChange(field.value)}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <label htmlFor={field.value} className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Format Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 border p-1 rounded-md">
              {["CSV", "Excel"].map((fmt) => (
                <Button
                  key={fmt}
                  variant={format === fmt ? "outline" : "ghost"}
                  className={`flex-1 rounded-md text-2xs sm:text-sm min-w-[60px] h-8 sm:h-9 ${
                    format === fmt ? "border-gray-300 text-gray-700 dark:text-gray-200" : "text-gray-500 hover:bg-transparent"
                  }`}
                  onClick={() => setFormat(fmt)}
                >
                  {fmt}
                </Button>
              ))}
            </div>
            <Button onClick={handleExport} className="text-white rounded-md h-8 sm:h-9 text-xs sm:text-sm">
              <RiShare2Fill className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-2">Export</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DatePicker({ id, date, onSelect, placeholder, label }: { id: string; date: Date | undefined; onSelect: (date: Date | undefined) => void; placeholder: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(date);

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    if (selectedDate) setMonth(selectedDate);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 flex-1">
      <label htmlFor={id} className="text-2xs sm:text-xs text-gray-400 dark:text-gray-100">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} variant="outline" className="w-full justify-start text-left font-normal pl-3 pr-10 py-2 border rounded-md text-xs sm:text-sm h-8 sm:h-9">
            <span className="truncate">{date ? formatDate(date) : placeholder}</span>
            <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar mode="single" selected={date} onSelect={handleSelect} month={month} className="rounded-md border" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}