"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import ComboBadge from "../Elo/ComboBadge";
import { TickerDriver } from "@/lib/services/drivers";
import { useFormatRelative } from "@/app/_hooks/useFormatRelative";

interface ActiveDriverItemProps {
  driver: TickerDriver;
  index: number;
  isDuplicate: boolean;
  prefersReducedMotion: boolean;
  registerItem: (index: number) => (el: HTMLAnchorElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => void;
  setIsHoverPaused: (paused: boolean) => void;
  hasDragged: boolean;
}

export default function ActiveDriverItem({
  driver,
  index,
  isDuplicate,
  prefersReducedMotion,
  registerItem,
  handleKeyDown,
  setIsHoverPaused,
  hasDragged,
}: ActiveDriverItemProps) {
  const { formatDaysAgo } = useFormatRelative();

  return (
    <div 
      role="listitem" 
      aria-hidden={isDuplicate}
      className="flex items-center h-full flex-shrink-0"
    >
      <Link
        href={`/drivers/${driver.guid}`}
        ref={!isDuplicate ? registerItem(index) : undefined}
        onClick={(e) => {
          if (hasDragged) {
            e.preventDefault();
          }
        }}
        onFocus={() => setIsHoverPaused(true)}
        onBlur={() => setIsHoverPaused(false)}
        onKeyDown={(e) => !isDuplicate && handleKeyDown(e, index)}
        // Tailwind v4 migration: Podmiana hover:bg na natywną klasę utility
        className="inline-flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-brand-navy-light focus-brand outline-none whitespace-nowrap select-none"
        tabIndex={isDuplicate || prefersReducedMotion ? -1 : 0}
        draggable={false}
      >
        {/* Czysty kolor tekstu bez zapisu var() */}
        <span className="font-semibold text-brand-text">
          {driver.name}
        </span>
        
        {/* Użycie spójnego tokenu !text-btn-mono dla małych danych monospaced */}
        <span className="rounded bg-brand-navy-light px-1.5 py-0.5 text-brand-yellow-text !text-btn-mono">
          {driver.elo}
        </span>
        
        {driver.combo > 0 && (
          <ComboBadge combo={driver.combo} />
        )}
        
        {/* Czysty kolor wyciszonego tekstu z v4 */}
        <span className="text-xs text-brand-text-muted">
          {formatDaysAgo(driver.lastActive)}
        </span>
      </Link>
    </div>
  );
}