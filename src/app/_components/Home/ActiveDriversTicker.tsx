"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ComboBadge from "../Elo/ComboBadge";
import { TickerDriver } from "@/lib/services/drivers";

interface ActiveDriversTickerProps {
  drivers: TickerDriver[];
  scrollSpeed?: number;
}

export default function ActiveDriversTicker({ drivers, scrollSpeed }: ActiveDriversTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const requestRef = useRef<number | null>(null);
  
  // NOWOŚĆ: Referencja przechowująca super-dokładną pozycję przewinięcia (pozwala na ułamki)
  const preciseScrollLeftRef = useRef(0);

  useEffect(() => {
    if (!scrollContainerRef.current || !drivers || drivers.length === 0 || isDragging || isPaused) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    // Inicjalizujemy wirtualną pozycję aktualnym stanem kontenera
    preciseScrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    const animate = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const speed = scrollSpeed ?? 0.8;
      
      // 1. Zwiększamy naszą wirtualną, dokładną pozycję o ułamek (np. 0.2)
      preciseScrollLeftRef.current += speed;

      const halfWidth = container.scrollWidth / 2;
      
      // 2. Obsługa zapętlenia na wirtualnej pozycji
      if (preciseScrollLeftRef.current >= halfWidth) {
        preciseScrollLeftRef.current -= halfWidth;
      }

      // 3. Przypisujemy zaokrągloną wartość do DOM (przeglądarka teraz prawidłowo przesunie co kilka klatek)
      container.scrollLeft = Math.floor(preciseScrollLeftRef.current);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDragging, isPaused, drivers, scrollSpeed]); // Dodano scrollSpeed do zależności

  if (!drivers || drivers.length === 0) return null;

  const duplicatedDrivers = [...drivers, ...drivers];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setIsPaused(!isPaused);
    }
  };

  // --- LOGIKA POINTER EVENTS ---
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
    
    // AKTUALIZACJA: Synchronizujemy wirtualny scroll z tym wykonanym przez użytkownika myszką
    preciseScrollLeftRef.current = targetScroll;
  };

  const handleGlobalPointerUp = () => {
    setIsDragging(false);
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
  };

  return (
    <section
      className="relative flex h-12 w-full items-center overflow-hidden bg-[var(--color-brand-navy-dark)] text-sm select-none"
      aria-label="Ostatnio aktywni kierowcy"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !isDragging && setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="z-20 flex h-full items-center bg-[var(--color-brand-navy)] px-4 font-bold uppercase tracking-wider text-[var(--color-brand-text)] shadow-md">
        Last Active
      </div>

      <div className="relative flex-1 overflow-hidden h-full">
        <div className="absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-[var(--color-brand-navy)] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-[var(--color-brand-navy)] to-transparent pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          className={`flex w-full items-center h-full gap-8 pl-6 overflow-x-hidden whitespace-nowrap touch-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } motion-reduce:overflow-x-auto`}
        >
          {duplicatedDrivers.map((driver, index) => {
            const isDuplicate = index >= drivers.length;

            return (
              <Link
                key={`${driver.guid}-${index}`}
                href={`/drivers/${driver.guid}`}
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-[var(--color-brand-navy-light)] focus-visible:outline-[var(--color-brand-yellow)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] focus-visible:outline-none"
                aria-hidden={isDuplicate}
                tabIndex={isDuplicate ? -1 : 0}
                draggable={false}
              >
                <span className="font-semibold text-[var(--color-brand-text)]">
                  {driver.name}
                </span>
                <span className="rounded bg-[var(--color-brand-navy-light)] px-1.5 py-0.5 text-xs font-mono text-[var(--color-brand-yellow-text)]">
                  {driver.elo}
                </span>
                {driver.combo > 0 && (
                  <ComboBadge combo={driver.combo} />
                )}
                <span className="text-[10px] uppercase tracking-tight text-[var(--color-brand-text-muted)] opacity-70">
                  {driver.lastActive}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setIsPaused(!isPaused)}
        onKeyDown={handleKeyDown}
        className="sr-only focus:not-sr-only focus:absolute focus:bottom-1 focus:right-4 focus:z-30 focus:rounded focus:bg-[var(--color-brand-yellow)] focus:px-3 focus:py-1 focus:text-[var(--color-brand-navy-dark)] focus:font-medium focus:outline-none"
        aria-pressed={isPaused}
      >
        {isPaused ? "Uruchom przewijanie karuzeli" : "Zatrzymaj przewijanie karuzeli"}
      </button>
    </section>
  );
}