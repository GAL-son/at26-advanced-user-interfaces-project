"use client";

import React from "react";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import UniversalSearch from "../UniversalSearch";
import DriverOrderTabs, { SortOption } from "./DriverOrderTabs";

interface DriverFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
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
    <Box
      component="div"
      role="search"
      aria-label={t("filter.barAriaLabel")}
      className="flex flex-col lg:flex-row gap-4 mb-6 p-4 items-stretch lg:items-center shadow-sm"
      sx={{
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
      }}
    >
      <Box className="flex-grow w-full">
        <DriverOrderTabs 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
          ariaLabel={t("filter.sortGroupLabel")}
          onNavigateVertical={onNavigateVertical}
        />
      </Box>
      
      <Box 
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
      </Box>
    </Box>
  );
}