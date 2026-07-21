"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Trophy, Award, ArrowDownAZ, Clock } from "lucide-react";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { DriverSortOption } from "@/lib/services/drivers.service";

interface DriverOrderTabsProps {
  sortBy: DriverSortOption;
  setSortBy: (val: DriverSortOption) => void;
  ariaLabel?: string;
  onNavigateVertical: (direction: "up" | "down") => void;
}

export default function DriverOrderTabs({ 
  sortBy, 
  setSortBy, 
  ariaLabel,
  onNavigateVertical 
}: DriverOrderTabsProps) {
  const t = useTranslations("Drivers");

  // Tablica opcji dopasowana dokładnie do wspieranych w backendzie wartości DriverSortOption
  const tabsConfig: { value: DriverSortOption; label: string; icon: React.ReactNode }[] = [
    { 
      value: "RATING_DESC", 
      label: t("tabs.rating"), 
      icon: <Trophy className="w-4 h-4" /> 
    },
    { 
      value: "BEST_RATING_DESC", 
      label: t("tabs.bestRating"), 
      icon: <Award className="w-4 h-4" /> 
    },
    { 
      value: "NAME_ASC", 
      label: t("tabs.alphabetical"), 
      icon: <ArrowDownAZ className="w-4 h-4" /> 
    },
    { 
      value: "LAST_ACTIVE_DESC", 
      label: t("tabs.lastActive"), 
      icon: <Clock className="w-4 h-4" /> 
    },
  ];

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: tabsConfig.length,
    orientation: "horizontal",
    loop: false,
    onLeave: (direction) => {
      if (direction === "next") {
        const searchInput = document.getElementById("driver-search-container")?.querySelector("input");
        searchInput?.focus();
      }
    }
  });

  const handleCombinedKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    const isBelowLg = window.matchMedia("(max-width: 1199px)").matches;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isBelowLg) {
        const searchInput = document.getElementById("driver-search-container")?.querySelector("input");
        searchInput?.focus();
      } else {
        onNavigateVertical("down");
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigateVertical("up");
      return;
    }

    handleKeyDown(e, index);
  };

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 w-full flex-grow bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]"
      role="tablist" 
      aria-label={ariaLabel}
    >
      {tabsConfig.map((tab, index) => {
        const isSelected = sortBy === tab.value;

        return (
          <button
            key={tab.value}
            id={`tab-driver-sort-${tab.value}`} 
            ref={registerItem(index) as any}
            onClick={() => setSortBy(tab.value)}
            onKeyDown={(e) => handleCombinedKeyDown(e, index)}
            aria-selected={isSelected}
            role="tab"
            tabIndex={isSelected ? 0 : -1} 
            className={`
              group focus-brand text-btn-mono uppercase font-bold tracking-wider
              flex flex-row items-center justify-center gap-2
              min-h-[40px] py-2 px-4 rounded-lg w-full transition-all duration-200 cursor-pointer
              ${isSelected 
                ? "text-[var(--color-brand-yellow-text)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)]" 
                : "text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] hover:bg-[color-mix(in_srgb,var(--color-brand-text)_8%,transparent)]"
              }
            `.trim()}
          >
            <span aria-hidden="true" className="flex items-center">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}