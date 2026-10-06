"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function EventImagePicker({ value, onChange }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageSrc = preview || value;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Cover Image</Label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-lg overflow-hidden aspect-video bg-muted cursor-pointer border-2 border-dashed transition-colors ${
          imageSrc ? "border-primary/50" : "border-dashed border-muted-foreground/30"
        }`}
      >
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt="Event cover preview"
              fill
              className="object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload</span>
            <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
          </div>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
