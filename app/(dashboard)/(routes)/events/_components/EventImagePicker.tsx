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
  onUploadingChange?: (uploading: boolean) => void;
}

async function compressCoverImage(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    let scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    let quality = 0.82;
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not process this image");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) throw new Error("Could not process this image");
      if (blob.size <= 2_500_000) return new File([blob], "event-cover.jpg", { type: "image/jpeg" });
      scale *= 0.8;
      quality = Math.max(0.58, quality - 0.05);
    }
    throw new Error("This image could not be reduced enough. Choose a smaller image.");
  } finally {
    bitmap.close();
  }
}

export function EventImagePicker({ value, onChange, onUploadingChange }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageSrc = preview || value;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const compressed = await compressCoverImage(file);
      const upload = new FormData();
      upload.append("image", compressed);
      const response = await fetch("/api/vendor/events/cover-image", { method: "POST", body: upload });
      const result = await response.json();
      if (!response.ok || result.status !== "success" || typeof result.data?.url !== "string") {
        throw new Error(result.message || "Event cover image upload failed");
      }
      setPreview(result.data.url);
      onChange(result.data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Event cover image upload failed");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative rounded-lg overflow-hidden aspect-video bg-muted ${uploading ? "cursor-wait" : "cursor-pointer"} border-2 border-dashed transition-colors ${
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
            {uploading && <span role="status" className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">Uploading cover image...</span>}
            <button
              disabled={uploading}
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
            <span className="text-sm text-muted-foreground">{uploading ? "Uploading cover image..." : "Click to upload"}</span>
            <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to 10MB</span>
          </div>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
