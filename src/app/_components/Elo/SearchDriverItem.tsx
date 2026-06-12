"use client";

import React from "react";
import { Box } from "@mui/material";
import { SearchResultItem } from "@/app/_components/UniversalSearch";

interface SearchDriverItemProps {
  item: SearchResultItem;
}

export default function SearchDriverItem({ item }: SearchDriverItemProps) {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", // 🛠️ POPRAWIONE: Poprawna wartość flexbox dla rozstrzelenia zawartości
        width: "100%",
        gap: 2,
        transition: "color 0.3s ease"
      }}
    >
      {/* Główna nazwa użytkownika */}
      <span 
        className="font-bold uppercase tracking-wide text-xs sm:text-sm truncate pr-2" // 🛠️ Docięte do jednej linii na mniejszych ekranach
        style={{ color: "var(--color-brand-text)" }}
        title={item.mainName} // Podpowiedź hover z pełną nazwą w razie ucięcia
      >
        {item.mainName}
      </span>

      {/* Sekcja ELO */}
      {item.currentElo !== undefined && (
        <span 
          className="text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
          style={{ 
            color: "var(--color-brand-yellow-text)",
            backgroundColor: "color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)"
          }}
        >
          ELO: {item.currentElo}
        </span>
      )}
    </Box>
  );
}