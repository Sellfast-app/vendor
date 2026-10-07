"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface TourStep {
  /** data-tour attribute value identifying the highlighted element */
  target: string;
  title: string;
  description: string;
}

interface OnboardingTourProps {
  /** Unique storage key; tour shows once per key (e.g. per user/store) */
  storageKey: string;
  steps: TourStep[];
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_WIDTH = 320;

export default function OnboardingTour({ storageKey, steps }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Show the tour only on the first visit for this storage key
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(storageKey)) {
      setStepIndex(0);
      setIsActive(true);
    }
  }, [storageKey]);

  const endTour = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, "done");
    } catch {
      // storage unavailable (private mode) — just close
    }
    setIsActive(false);
  }, [storageKey]);

  // Scroll to and track the highlighted element on every step change
  useEffect(() => {
    if (!isActive) return;

    const targetSelector = `[data-tour="${steps[stepIndex].target}"]`;

    // Always bring the target into view (Next/Back can land off-screen)
    document
      .querySelector<HTMLElement>(targetSelector)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    const updateRect = () => {
      const target = document.querySelector<HTMLElement>(targetSelector);
      setRect(target?.getBoundingClientRect() ?? null);
    };

    updateRect();

    // Follow the smooth-scroll animation and any layout shifts
    const interval = window.setInterval(updateRect, 100);
    window.addEventListener("resize", updateRect);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", updateRect);
    };
  }, [isActive, stepIndex, steps]);

  // Keyboard support: Escape skips, arrows navigate
  useEffect(() => {
    if (!isActive) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") endTour();
      if (event.key === "ArrowRight") handleNext();
      if (event.key === "ArrowLeft") handleBack();
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stepIndex, endTour]);

  if (!isActive || typeof document === "undefined") return null;

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
    } else {
      endTour();
    }
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  const pad = SPOTLIGHT_PADDING;
  const spotlight = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // Prefer below the target; flip above when there is more room there
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const spaceAbove = rect ? rect.top : 0;
  const placeAbove = rect ? spaceAbove > spaceBelow && spaceBelow < 180 : false;

  const tooltipTop = rect
    ? placeAbove
      ? Math.max(12, rect.top - 148)
      : Math.min(window.innerHeight - 180, rect.bottom + 12)
    : window.innerHeight / 2 - 80;

  const tooltipLeft = rect
    ? Math.min(
        Math.max(12, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
        window.innerWidth - TOOLTIP_WIDTH - 12
      )
    : window.innerWidth / 2 - TOOLTIP_WIDTH / 2;

  const isLastStep = stepIndex === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Keep the target clear by placing the dimmed/blurred backdrop around it. */}
      {spotlight ? (
        <>
          <div
            aria-hidden
            className="absolute left-0 right-0 top-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
            style={{ height: spotlight.top }}
            onClick={endTour}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
            style={{ top: spotlight.top + spotlight.height }}
            onClick={endTour}
          />
          <div
            aria-hidden
            className="absolute left-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
            style={{
              top: spotlight.top,
              width: spotlight.left,
              height: spotlight.height,
            }}
            onClick={endTour}
          />
          <div
            aria-hidden
            className="absolute right-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              height: spotlight.height,
            }}
            onClick={endTour}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
          onClick={endTour}
        />
      )}

      {/* Highlight ring around the current target */}
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl border-2 border-primary bg-transparent transition-all duration-200"
          style={{
            ...spotlight,
            zIndex: 1,
            backgroundColor: "transparent",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding step ${stepIndex + 1} of ${steps.length}`}
        className="fixed rounded-xl border bg-background p-4 shadow-xl"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: TOOLTIP_WIDTH,
          maxWidth: "calc(100vw - 24px)",
        }}
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={endTour}
            aria-label="Skip tour"
            className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-foreground">
          {steps[stepIndex].title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {steps[stepIndex].description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <span
                key={step.target + index}
                className={`h-1.5 rounded-full transition-all ${
                  index === stepIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
