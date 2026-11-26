"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getV2BusinessType, type V2BusinessType } from "@/lib/v2";

type StoreBusinessContextValue = {
  businessType: V2BusinessType | null;
  storeName: string;
  status: "loading" | "ready" | "error";
  error: string;
  retry: () => void;
};

const StoreBusinessContext = createContext<StoreBusinessContextValue | null>(null);

export function StoreBusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessType, setBusinessType] = useState<V2BusinessType | null>(null);
  const [storeName, setStoreName] = useState("");
  const [status, setStatus] = useState<StoreBusinessContextValue["status"]>("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError("");

    fetch("/api/store", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        const store = result.data?.storeDetails;
        if (!response.ok || result.status !== "success" || !store) {
          throw new Error(result.message || "Store details are temporarily unavailable.");
        }

        const resolved = getV2BusinessType(store.metadata?.v2?.business_type ?? store.business_type);
        if (!resolved) throw new Error("The store business type could not be identified.");
        return { businessType: resolved, storeName: String(store.store_name || store.name || "") };
      })
      .then(resolved => {
        if (controller.signal.aborted) return;
        setBusinessType(resolved.businessType);
        setStoreName(resolved.storeName);
        setStatus("ready");
      })
      .catch(loadError => {
        if (controller.signal.aborted) return;
        setBusinessType(null);
        setStoreName("");
        setError(loadError instanceof Error ? loadError.message : "Store details are temporarily unavailable.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  const value = useMemo(() => ({ businessType, storeName, status, error, retry }), [businessType, storeName, status, error, retry]);
  return <StoreBusinessContext.Provider value={value}>{children}</StoreBusinessContext.Provider>;
}

export function useStoreBusiness() {
  const value = useContext(StoreBusinessContext);
  if (!value) throw new Error("useStoreBusiness must be used inside StoreBusinessProvider");
  return value;
}
