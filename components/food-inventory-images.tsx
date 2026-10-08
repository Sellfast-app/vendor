"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function FoodInventoryImages({ images, onChange, onBusy }: {
  images: string[]; onChange: (images: string[]) => void; onBusy: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Image</p>
    {images.length > 0 && <div className="relative h-44 overflow-hidden rounded-lg border bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[Math.min(selected, images.length - 1)]} alt="Selected food item" className="h-full w-full object-contain" />
    </div>}
    <button type="button" disabled={busy || images.length >= 5} onClick={() => input.current?.click()}
      className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 p-4 disabled:opacity-50">
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
      <span className="text-sm font-medium">{busy ? "Preparing images..." : "Upload image"}</span>
      <span className="text-xs text-muted-foreground">PNG, JPG or GIF up to 10 MB · Maximum 5 images</span>
    </button>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/gif" multiple className="hidden" aria-label="Food images" onChange={async event => {
      const files = Array.from(event.target.files || []); event.target.value = "";
      if (!files.length || lock.current) return;
      setError("");
      if (files.length + images.length > 5) { setError("Choose up to five images in total."); return; }
      if (files.some(file => !["image/png", "image/jpeg", "image/gif"].includes(file.type) || file.size > 10 * 1024 * 1024)) {
        setError("Use PNG, JPG or GIF files no larger than 10 MB."); return;
      }
      lock.current = true; setBusy(true); onBusy(true);
      try {
        const added: string[] = [];
        for (const file of files) {
          const compressed = await imageCompression(file, { maxSizeMB: 0.25, maxWidthOrHeight: 1200, useWebWorker: false });
          added.push(await imageCompression.getDataUrlFromFile(compressed));
        }
        onChange([...images, ...added]);
      } catch { setError("Could not process these images. Please try again."); }
      finally { lock.current = false; setBusy(false); onBusy(false); }
    }} />
    <div className="flex flex-wrap gap-3">
      {images.map((src, index) => <div key={index} className="relative">
        <button type="button" onClick={() => setSelected(index)} aria-label={"Preview image " + (index + 1)} aria-pressed={selected === index}
          className={`h-14 w-14 overflow-hidden rounded-md border-2 ${selected === index ? "border-primary" : "border-transparent"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={"Food image " + (index + 1)} className="h-full w-full object-cover" />
        </button>
        <button type="button" title="Remove image" aria-label={"Remove image " + (index + 1)} disabled={busy} onClick={() => { onChange(images.filter((_, i) => i !== index)); setSelected(0); }}
          className="absolute -right-1 -top-1 rounded-full border bg-background p-0.5"><X className="h-3 w-3" /></button>
      </div>)}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
