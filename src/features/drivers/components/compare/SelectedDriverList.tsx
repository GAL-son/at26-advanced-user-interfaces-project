"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DriverBasicDto } from "@/lib/services/drivers.service";

interface SelectedDriversListProps {
  drivers: DriverBasicDto[];
  onRemove: (guid: string) => void;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function SelectedDriversList({ 
  drivers, 
  onRemove,
  onNavigateVertical 
}: SelectedDriversListProps) {
  const t = useTranslations("CompareDrivers.search");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>, index: number) => {
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

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      const driver = drivers[index];
      if (driver) {
        onRemove(driver.guid);
        // Przekierowanie fokusu po usunięciu
        setTimeout(() => {
          const nextIndex = index === drivers.length - 1 ? index - 1 : index;
          if (nextIndex >= 0) {
            document.getElementById(`selected-driver-chip-${nextIndex}`)?.focus();
          } else {
            document.getElementById("driver-search-input")?.focus();
          }
        }, 50);
      }
    }
  };

  return (
    <div className="md:mt-0">
      <h2 className="!text-btn-mono uppercase font-bold text-[var(--color-brand-text-muted)] mb-3">
        {t("currentlyComparing")}
      </h2>
      
      <div className="flex flex-wrap gap-2" role="list" aria-label={t("listAriaLabel")}>
        {drivers.length === 0 ? (
          <p className="!text-btn-mono text-[var(--color-brand-text-muted)]/60 italic lowercase" role="status">
            {t("noDriversSelected")}
          </p>
        ) : (
          drivers.map((driver, index) => (
            <div key={driver.guid} role="listitem">
              <div
                id={`selected-driver-chip-${index}`}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={t("driverChipAriaLabel", { driverName: driver.mainName })}
                className="group flex items-center gap-1.5 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] border border-[var(--color-brand-navy-light)] rounded !text-btn-mono uppercase px-2.5 py-1 transition-colors hover:border-[var(--color-brand-yellow-hover)] focus-brand cursor-default"
              >
                <span>
                  {driver.mainName} {driver.currentRating ? `(${Math.round(driver.currentRating)})` : ""}
                </span>

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(driver.guid);
                  }}
                  aria-label={`Remove ${driver.mainName}`}
                  className="flex items-center justify-center text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-hover)] hover:!text-[var(--color-brand-yellow-hover)] transition-colors p-0.5 rounded focus:outline-none"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}