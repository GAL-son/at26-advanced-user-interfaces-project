"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface DriverBasicInfo {
  guid: string;
  mainName: string;
  currentElo?: number;
}

interface SelectedDriversListProps {
  drivers: DriverBasicInfo[];
  onRemove: (guid: string) => void;
  onNavigateVertical?: (direction: "up" | "down") => void; // Obsługuje wyjście w górę i w dół
}

export default function SelectedDriversList({ 
  drivers, 
  onRemove,
  onNavigateVertical 
}: SelectedDriversListProps) {
  const t = useTranslations("CompareDrivers.search");

  // Obsługa nawigacji strzałkami wewnątrz listy chipów
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextChip = document.getElementById(`selected-driver-chip-${index + 1}`);
      nextChip?.focus();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index === 0) {
        // Jeśli to pierwszy chip, wracamy w lewo do inputu wyszukiwarki
        const searchInput = document.getElementById("driver-search-input");
        searchInput?.focus();
      } else {
        const prevChip = document.getElementById(`selected-driver-chip-${index - 1}`);
        prevChip?.focus();
      }
    }

    // Wyjście w górę z całej sekcji
    if (e.key === "ArrowUp" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("up"); 
    }

    // NOWOŚĆ: Wyjście w dół z całej sekcji (np. do sekcji wykresu)
    if (e.key === "ArrowDown" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("down"); 
    }
  };

  return (
    <div className="md:mt-0">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted font-bold mb-3">
        {t("currentlyComparing")}
      </h2>
      <div className="flex flex-wrap gap-2" role="list" aria-label={t("listAriaLabel")}>
        {drivers.length === 0 ? (
          <p className="text-xs text-brand-text-muted/60 font-mono italic" role="status">
            {t("noDriversSelected")}
          </p>
        ) : (
          drivers.map((driver, index) => (
            <div key={driver.guid} role="listitem">
              <Chip
                id={`selected-driver-chip-${index}`}
                label={`${driver.mainName} ${driver.currentElo ? `(${Math.round(driver.currentElo)})` : ""}`}
                onDelete={() => onRemove(driver.guid)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={t("driverChipAriaLabel", { driverName: driver.mainName })}
                deleteIcon={
                  <CloseIcon
                    className="!text-brand-text-muted hover:!text-brand-yellow"
                    aria-hidden="true"
                  />
                }
                className="!bg-brand-navy !text-brand-text !border !border-brand-navy-light font-mono text-xs uppercase !p-1 focus-brand"
                sx={{
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "var(--color-brand-yellow-hover)",
                  },
                  "&:focus, &:focus-visible": {
                    outline: "2px solid var(--color-brand-yellow-hover) !important",
                    outlineOffset: "1px"
                  }
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}