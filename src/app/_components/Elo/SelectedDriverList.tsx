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
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function SelectedDriversList({ 
  drivers, 
  onRemove,
  onNavigateVertical 
}: SelectedDriversListProps) {
  const t = useTranslations("CompareDrivers.search");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextChip = document.getElementById(`selected-driver-chip-${index + 1}`);
      nextChip?.focus();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index === 0) {
        const searchInput = document.getElementById("driver-search-input");
        searchInput?.focus();
      } else {
        const prevChip = document.getElementById(`selected-driver-chip-${index - 1}`);
        prevChip?.focus();
      }
    }

    if (e.key === "ArrowUp" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("up"); 
    }

    if (e.key === "ArrowDown" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("down"); 
    }
  };

  return (
    <div className="md:mt-0">
      {/* POPRAWKA: Przejście z surowych klas rozmiaru na token !text-btn-mono z wagą czcionki i trackingiem */}
      <h2 className="!text-btn-mono uppercase font-bold text-brand-text-muted mb-3">
        {t("currentlyComparing")}
      </h2>
      <div className="flex flex-wrap gap-2" role="list" aria-label={t("listAriaLabel")}>
        {drivers.length === 0 ? (
          /* POPRAWKA: Stan pusty dostosowany do tokenu !text-btn-mono */
          <p className="!text-btn-mono text-brand-text-muted/60 italic lowercase" role="status">
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
                /* POPRAWKA: Podpięcie klasy !text-btn-mono i wyczyszczenie inline styles czcionek */
                className="!bg-brand-navy !text-brand-text !border !border-brand-navy-light !text-btn-mono uppercase !p-1 focus-brand"
                sx={{
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "var(--color-brand-yellow-hover)",
                  },
                  /* POPRAWKA: Kontrolę nad focusem w pełni oddajemy do spójnej klasy narzędziowej focus-brand */
                  "&:focus, &:focus-visible": {
                    outline: "none",
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