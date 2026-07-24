"use client";

import React from "react";

export interface TabItem<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface TabsProps<T extends string | number> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  variant?: "scrollable" | "grid";
  onNavigateVertical?: (direction: "up" | "down") => void;
  onLeaveNext?: () => void;
}

export default function Tabs<T extends string | number>({
  items,
  value,
  onChange,
  ariaLabel,
  variant = "scrollable",
  onNavigateVertical,
  onLeaveNext,
}: TabsProps<T>) {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    // Nawigacja pionowa (przejście między sekcjami strony)
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onNavigateVertical?.("down");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigateVertical?.("up");
      return;
    }

    // Nawigacja pozioma (między zakładkami)
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < items.length - 1) {
        onChange(items[index + 1].value);
      } else if (onLeaveNext) {
        onLeaveNext();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) {
        onChange(items[index - 1].value);
      }
    }
  };

  // Kontener z zachowaniem spójnego tła i obramowania
  const containerClasses =
    variant === "grid"
      ? "grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 w-full flex-grow bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]"
      : "flex gap-1.5 p-1 overflow-x-auto w-full bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]";

  return (
    <div className={containerClasses} role="tablist" aria-label={ariaLabel}>
      {items.map((tab, index) => {
        const isSelected = value === tab.value;

        return (
          <button
            key={String(tab.value)}
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              group focus-brand text-btn-mono uppercase font-bold tracking-wider text-xs
              flex flex-row items-center justify-center gap-2
              min-h-[40px] py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap
              ${variant === "grid" ? "w-full" : "shrink-0"}
              ${
                isSelected
                  ? "text-[var(--color-brand-yellow-text)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)]"
                  : "text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] hover:bg-[color-mix(in_srgb,var(--color-brand-text)_8%,transparent)]"
              }
            `.trim()}
          >
            {tab.icon && (
              <span aria-hidden="true" className="flex items-center shrink-0">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}