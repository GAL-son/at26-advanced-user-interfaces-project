"use client";

import React from "react";
import {DriverBasicDto} from "@/lib/services/drivers.service";

interface SearchDriverItemProps {
  item: DriverBasicDto;
}

export default function SearchDriverItem({ item }: SearchDriverItemProps) {
  return (
    <div className="flex items-center justify-between w-full gap-4 transition-colors duration-300">
      {/* Główna nazwa użytkownika */}
      <span
        className="font-bold uppercase tracking-wide text-xs sm:text-sm truncate pr-2 text-[var(--color-brand-text)]"
        title={item.mainName}
      >
        {item.mainName}
      </span>

      {/* Sekcja ELO - renderuje się jeśli wartość występuje w obiekcie */}
      {item.currentRating !== undefined && (
        <span className="text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0 text-[var(--color-brand-yellow-text)] bg-[color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)]">
          ELO: {Math.round(item.currentRating)}
        </span>
      )}
    </div>
  );
}