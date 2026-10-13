"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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

const TOOLTIP_WIDTH = 320;

export default function OnboardingTour({ storageKey, steps }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [radius, setRadius] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(180);

  useEffect(() => {
    if (!isActive || !tooltipRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setTooltipHeight(entry.target.getBoundingClientRect().height);
    });
    observer.observe(tooltipRef.current);
    return () => observer.disconnect();
  }, [isActive]);

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
    if (!isActive || !steps[stepIndex]) return;

    const targetSelector = `[data-tour="${steps[stepIndex].target}"]`;

    // Always bring the target into view (Next/Back can land off-screen)
    const findTarget = () => Array.from(document.querySelectorAll<HTMLElement>(targetSelector))
      .find((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && getComputedStyle(element).visibility !== "hidden";
      });
    findTarget()?.scrollIntoView({ behavior: "smooth", block: "center" });

    const updateRect = () => {
      const target = findTarget();
      setRect(target?.getBoundingClientRect() ?? null);
      setRadius(target ? Math.max(...[
        "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
      ].map((property) => parseFloat(getComputedStyle(target)[property as keyof CSSStyleDeclaration] as string) || 0)) : 0);
    };

    updateRect();

    // Follow the smooth-scroll animation and any layout shifts
    const interval = window.setInterval(updateRect, 100);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
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

  if (!isActive || !steps[stepIndex] || typeof document === "undefined") return null;

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

  const spotlight = rect
    ? {
        top: Math.max(0, rect.top),
        left: Math.max(0, rect.left),
        width: Math.max(0, Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left)),
        height: Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top)),
      }
    : null;

  // One rounded cutout avoids overlapping blur panes and clear rectangular halos.
  let backdropClip: string | undefined;
  if (spotlight) {
    const { left: x, top: y, width: w, height: h } = spotlight;
    const r = Math.min(radius, w / 2, h / 2);
    backdropClip = `path(evenodd, "M0 0H${window.innerWidth}V${window.innerHeight}H0Z M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z")`;
  }

  // Prefer below the target; flip above when there is more room there
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const spaceAbove = rect ? rect.top : 0;
  const placeAbove = rect ? spaceAbove > spaceBelow && spaceBelow < tooltipHeight + 24 : false;

  const tooltipTop = rect
    ? placeAbove
      ? rect.top - tooltipHeight - 12
      : rect.bottom + 12
    : (window.innerHeight - tooltipHeight) / 2;

  const tooltipLeft = rect
    ? Math.min(
        Math.max(12, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
        Math.max(12, window.innerWidth - TOOLTIP_WIDTH - 12)
      )
    : Math.max(12, window.innerWidth / 2 - TOOLTIP_WIDTH / 2);

  const isLastStep = stepIndex === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        aria-hidden
        className="absolute inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
        style={{ clipPath: backdropClip }}
        onClick={endTour}
      />

      {/* Highlight ring around the current target */}
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute border-2 border-primary bg-transparent"
          style={{
            ...spotlight,
            borderRadius: radius,
            zIndex: 1,
            backgroundColor: "transparent",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding step ${stepIndex + 1} of ${steps.length}`}
        className="fixed rounded-xl border bg-background p-4 shadow-xl"
        style={{
          top: Math.max(12, Math.min(tooltipTop, window.innerHeight - tooltipHeight - 12)),
          left: tooltipLeft,
          width: TOOLTIP_WIDTH,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100dvh - 24px)",
          overflowY: "auto",
          zIndex: 2,
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
