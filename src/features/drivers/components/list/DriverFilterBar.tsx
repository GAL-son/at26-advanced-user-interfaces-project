"use client";

import React from "react";
import { useTranslations } from "next-intl";

import UniversalSearch from "@/app/_components/UniversalSearch";

import { DriverSortOption } from "../../drivers.types";
import DriverOrderTabs from "./DriverOrderTabs";


interface DriverFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  sortBy: DriverSortOption;
  setSortBy: (val: DriverSortOption) => void;
  onNavigateVertical: (direction: "up" | "down") => void;
}

export default function DriverFilterBar({
  search,
  setSearch,
  sortBy,
  setSortBy,
  onNavigateVertical,
}: DriverFilterBarProps) {
  const t = useTranslations("Drivers");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const isBelowLg = window.matchMedia("(max-width: 1199px)").matches;

    if (e.key === "ArrowLeft" && !isBelowLg) {
      e.preventDefault();
      const activeTab = document.getElementById(`tab-driver-sort-${sortBy}`);
      activeTab?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isBelowLg) {
        const activeTab = document.getElementById(`tab-driver-sort-${sortBy}`);
        activeTab?.focus();
      } else {
        onNavigateVertical("up");
      }
    } else if (e.key === "ArrowDown" || (e.key === "ArrowRight" && isBelowLg)) {
      e.preventDefault();
      onNavigateVertical("down");
    }
  };

  return (
    <div
      role="search"
      aria-label={t("filter.barAriaLabel")}
      className="flex flex-col lg:flex-row gap-4 mb-6 p-4 items-stretch lg:items-center shadow-sm bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]"
    >
      <div className="flex-grow w-full">
        <DriverOrderTabs
          sortBy={sortBy}
          setSortBy={setSortBy}
          ariaLabel={t("filter.sortGroupLabel")}
          onNavigateVertical={onNavigateVertical}
        />
      </div>

      <div
        id="driver-search-container"
        className="w-full lg:w-80 flex-shrink-0"
        onKeyDown={handleSearchKeyDown}
      >
        <UniversalSearch
          value={search}
          onChange={setSearch}
          label={t("filter.searchLabel")}
          placeholder={t("filter.searchPlaceholder")}
          aria-describedby="search-hint"
          results={[]}
          onSelectResult={() => {}}
          renderItem={() => null}
        />
        <span id="search-hint" className="sr-only">
          {t("filter.searchHint")}
        </span>
      </div>
    </div>
  );
}