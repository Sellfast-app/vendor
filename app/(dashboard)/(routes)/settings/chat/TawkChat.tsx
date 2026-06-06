"use client";

import { useEffect, useState } from "react";

const TAWK_SCRIPT_ID = "tawk-to-support-script";
const TAWK_SCRIPT_URL =
  "https://embed.tawk.to/6a1ad031aeb29e1c2e9125bd/1jpsbqgl2";

type TawkApi = {
  hideWidget?: () => void;
  maximize?: () => void;
  showWidget?: () => void;
  onLoad?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkChat() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const openChat = () => {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
      setIsLoading(false);
    };

    if (document.getElementById(TAWK_SCRIPT_ID)) {
      openChat();
      return () => window.Tawk_API?.hideWidget?.();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = openChat;
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = TAWK_SCRIPT_URL;
    script.charset = "UTF-8";
    script.crossOrigin = "*";
    document.body.appendChild(script);

    return () => {
      window.Tawk_API?.hideWidget?.();
    };
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Opening chat support..." : "Chat support is open."}
      </p>
    </div>
  );
}
