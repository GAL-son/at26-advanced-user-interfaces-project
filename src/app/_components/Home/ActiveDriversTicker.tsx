"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TickerDriver } from "@/lib/services/drivers";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton } from "@mui/material";
import ActiveDriverItem from "./ActiveDriverItem"; // Import wydzielonego komponentu

interface ActiveDriversTickerProps {
  drivers: TickerDriver[];
  scrollSpeed?: number;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function ActiveDriversTicker({ drivers, scrollSpeed, onNavigateVertical }: ActiveDriversTickerProps) {
  const t = useTranslations("Home");

  const [isPaused, setIsPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const preciseScrollLeftRef = useRef(0);

  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const requestRef = useRef<number | null>(null);

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: drivers.length,
    orientation: "horizontal",
    onLeave: (direction) => {
      if (onNavigateVertical) {
        onNavigateVertical(direction === "next" ? "down" : "up");
      }
    },
    onIndexChange: (_, targetLink) => {
      const container = scrollContainerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const linkLeft = targetLink.offsetLeft;
        const linkWidth = targetLink.offsetWidth;
        const targetScroll = linkLeft - containerWidth / 2 + linkWidth / 2;
        container.scrollLeft = targetScroll;
        preciseScrollLeftRef.current = targetScroll;
      }
    }
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (
      !scrollContainerRef.current || 
      !drivers || 
      drivers.length === 0 || 
      isDragging || 
      isPaused || 
      isHoverPaused || 
      prefersReducedMotion
    ) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    preciseScrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    const animate = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const speed = scrollSpeed ?? 0.8;
      preciseScrollLeftRef.current += speed;

      const halfWidth = container.scrollWidth / 2;

      if (preciseScrollLeftRef.current >= halfWidth) {
        preciseScrollLeftRef.current -= halfWidth;
      }

      container.scrollLeft = Math.floor(preciseScrollLeftRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDragging, isPaused, isHoverPaused, drivers, scrollSpeed, prefersReducedMotion]);

  if (!drivers || drivers.length === 0) return null;

  const duplicatedDrivers = [...drivers, ...drivers];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    hasDraggedRef.current = false;

    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    startXRef.current = e.clientX;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
  };

  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (!scrollContainerRef.current) return;

    const currentX = e.clientX;
    const deltaX = currentX - startXRef.current;

    if (Math.abs(deltaX) <= 10) return;

    hasDraggedRef.current = true;

    const container = scrollContainerRef.current;
    let targetScroll = scrollLeftRef.current - deltaX * 1.2;

    const halfWidth = container.scrollWidth / 2;
    if (targetScroll < 0) {
      targetScroll += halfWidth;
    } else if (targetScroll >= halfWidth) {
      targetScroll -= halfWidth;
    }

    container.scrollLeft = targetScroll;
    preciseScrollLeftRef.current = targetScroll;
  };

  const handleGlobalPointerUp = () => {
    setIsDragging(false);
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
  };

  return (
    <section
      className="relative flex h-12 w-full items-center overflow-hidden bg-[var(--color-brand-navy-dark)] text-sm border-b border-[var(--color-brand-navy-light)]"
      aria-label={t("tickerAriaLabel")}
    >
      <div className="z-20 flex h-full items-center bg-[var(--color-brand-navy)] px-4 font-bold uppercase tracking-wider text-[var(--color-brand-text)] shadow-md border-r border-[var(--color-brand-navy-light)] flex-shrink-0">
        {t("lastActive")}
      </div>

      <div 
        className="relative flex-1 overflow-hidden h-full"
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => {
          setIsHoverPaused(false);
          if (isDragging) setIsDragging(false);
        }}
      >
        <div className="absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-[var(--color-brand-navy-dark)] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-[var(--color-brand-navy-dark)] to-transparent pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          role="list"
          aria-label="Active drivers feed"
          // Usunięto whitespace-nowrap stąd, ponieważ każdy potomek (ActiveDriverItem) dba o to sam na poziomie własnego linku
          className={`flex w-full items-center h-full gap-8 pl-6 touch-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${prefersReducedMotion ? "overflow-x-auto" : "overflow-x-hidden"}`}
        >
          {duplicatedDrivers.map((driver, index) => {
            const isDuplicate = index >= drivers.length;

            return (
              <ActiveDriverItem
                key={`${driver.guid}-${index}`}
                driver={driver}
                index={index}
                isDuplicate={isDuplicate}
                prefersReducedMotion={prefersReducedMotion}
                registerItem={registerItem}
                handleKeyDown={handleKeyDown}
                setIsHoverPaused={setIsHoverPaused}
                hasDragged={hasDraggedRef.current}
              />
            );
          })}
        </div>
      </div>

      <div className="z-20 flex h-full items-center bg-[var(--color-brand-navy)] px-2 border-l border-[var(--color-brand-navy-light)] flex-shrink-0">
        <IconButton
          onClick={() => setIsPaused((prev) => !prev)}
          size="small"
          aria-pressed={isPaused}
          aria-label={isPaused ? t("tickerPlay") : t("tickerPause")}
          sx={{
            color: isPaused ? "var(--color-brand-yellow)" : "var(--color-brand-text-muted)",
            backgroundColor: isPaused ? "color-mix(in srgb, var(--color-brand-yellow) 10%, transparent)" : "transparent",
            "&:hover": {
              color: "var(--color-brand-text)",
              backgroundColor: "color-mix(in srgb, var(--color-brand-text) 8%, transparent)",
            },
            "&:focus-visible": {
              outline: "2px solid var(--color-brand-yellow)",
              borderRadius: "4px"
            }
          }}
        >
          {isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
        </IconButton>
      </div>
    </section>
  );
}