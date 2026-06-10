"use client";

import { useEffect } from "react";

let isHandlingUnauthorized = false;

export function AuthResponseInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const interceptedFetch: typeof window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const request = args[0];
      const requestUrl =
        typeof request === "string"
          ? request
          : request instanceof URL
            ? request.href
            : request.url;
      const pathname = new URL(requestUrl, window.location.origin).pathname;

      if (
        response.status === 401 &&
        pathname !== "/api/auth/logout" &&
        !isHandlingUnauthorized
      ) {
        isHandlingUnauthorized = true;

        void (async () => {
          try {
            await originalFetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
            });
          } catch (error) {
            console.error("Failed to notify the logout endpoint:", error);
          } finally {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie =
              "store_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("/login");
          }
        })();
      }

      return response;
    };

    window.fetch = interceptedFetch;

    return () => {
      if (window.fetch === interceptedFetch) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return null;
}
