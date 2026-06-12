"use client";

import React from "react";
import { Box } from "@mui/material";
import UniversalSearch from "../UniversalSearch";
import DriverOrderTabs, { SortOption } from "./DriverOrderTabs"; // Dostosuj ścieżkę importu

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
  return (
    <Box
      className="flex flex-col lg:flex-row gap-4 mb-6 p-4 items-stretch lg:items-center shadow-sm"
      sx={{
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* WYDZIELONE TABSY SORTOWANIA */}
      <DriverOrderTabs sortBy={sortBy} setSortBy={setSortBy} />

      {/* WYSZUKIWARKA */}
      <Box className="w-full lg:w-80 flex-shrink-0">
        <UniversalSearch
          value={search}
          onChange={setSearch}
          label="Search driver or alias..."
          placeholder="Type here..."
        />
      </Box>
    </Box>
  );
}