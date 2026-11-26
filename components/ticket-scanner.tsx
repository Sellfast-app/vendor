"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TicketScanner({ onScan }: { onScan: (token: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const scan = useRef(onScan);
  scan.current = onScan;

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let controls: { stop: () => void } | undefined;
    async function start() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (disposed || !video.current) return;
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          video.current,
          (result, _error, session) => {
            if (!result || disposed) return;
            disposed = true;
            session.stop();
            setActive(false);
            scan.current(result.getText());
          },
        );
        if (disposed) controls.stop();
      } catch {
        if (!disposed) {
          setError("Camera unavailable. Allow camera access over HTTPS, or enter the ticket code below.");
          setActive(false);
        }
      }
    }
    void start();
    return () => { disposed = true; controls?.stop(); };
  }, [active]);

  return <div className="space-y-4">
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      <video ref={video} muted playsInline className="h-full w-full object-cover" />
      {!active && <div className="absolute inset-0 flex items-center justify-center text-white"><CameraOff className="h-8 w-8" /></div>}
    </div>
    <Button className="w-full gap-2" onClick={() => { setError(""); setActive(!active); }}>
      <Camera className="h-4 w-4" />{active ? "Stop camera" : "Scan QR code"}
    </Button>
    <form className="flex gap-2" onSubmit={event => { event.preventDefault(); setActive(false); if (code.trim()) scan.current(code.trim()); }}>
      <Input aria-label="Ticket code" placeholder="Enter ticket code" value={code} onChange={event => setCode(event.target.value)} />
      <Button variant="outline" disabled={!code.trim()}>Find</Button>
    </form>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
