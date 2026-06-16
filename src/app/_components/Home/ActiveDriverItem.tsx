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
      className="flex items-center h-full flex-shrink-0" // Blokujemy kurczenie się elementu w poziomie
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
        // whitespace-nowrap gwarantuje, że tekst (w tym data) nigdy nie przejdzie do nowej linii
        className="inline-flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-[var(--color-brand-navy-light)] focus-brand outline-none whitespace-nowrap select-none"
        tabIndex={isDuplicate || prefersReducedMotion ? -1 : 0}
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
        
        <span className="text-xs text-[var(--color-brand-text-muted)]">
          {formatDaysAgo(driver.lastActive)}
        </span>
      </Link>
    </div>
  );
}