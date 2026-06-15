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
}

export default function DriverFilterBar({
  search,
  setSearch,
  sortBy,
  setSortBy,
}: DriverFilterBarProps) {
  const t = useTranslations("Drivers");

  return (
    <Box
      // WCAG: Definiujemy rolę "search" lub "form" (jeśli to zestaw filtrów), aby czytniki ułatwiły nawigację
      component="div"
      role="search"
      aria-label={t("filter.barAriaLabel")}
      className="flex flex-col lg:flex-row gap-4 mb-6 p-4 items-stretch lg:items-center shadow-sm"
      sx={{
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Przekazujemy label, aby kontener nawigacji wewnątrz tabsów miał jasny cel */}
      <DriverOrderTabs 
        sortBy={sortBy} 
        setSortBy={setSortBy} 
        ariaLabel={t("filter.sortGroupLabel")}
      />
      
      <Box className="w-full lg:w-80 flex-shrink-0">
        <UniversalSearch
          value={search}
          onChange={setSearch}
          label={t("filter.searchLabel")}
          placeholder={t("filter.searchPlaceholder")}
          // Przekazujemy dodatkowy opis, np. informację, że wyniki filtrują się automatycznie
          ariaDescribedBy="search-hint"
        />
        {/* Niewidoczna informacja techniczna dla czytnika */}
        <span id="search-hint" className="sr-only">
          {t("filter.searchHint")}
        </span>
      </Box>
    </Box>
  );
}