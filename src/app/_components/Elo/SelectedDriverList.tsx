"use client";

import React from "react";
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
}

export default function SelectedDriversList({ drivers, onRemove }: SelectedDriversListProps) {
  return (
    <div className="md:mt-0">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted font-bold mb-3">
        Currently Comparing
      </h2>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Selected drivers for comparison">
        {drivers.length === 0 ? (
          <p className="text-xs text-brand-text-muted/60 font-mono italic" role="status">
            No drivers selected. Use the search bar above to populate telemetry.
          </p>
        ) : (
          drivers.map((driver) => (
            <div key={driver.guid} role="listitem">
              <Chip
                label={`${driver.mainName} ${driver.currentElo ? `(${Math.round(driver.currentElo)})` : ""}`}
                onDelete={() => onRemove(driver.guid)}
                // WCAG 1.3.1 & 4.1.2: Każdy przycisk usuwania ma unikalny label słowny zamiast samego ikony graficznej
                aria-label={`Driver ${driver.mainName}, press backspace or delete to remove from comparison`}
                deleteIcon={
                  <CloseIcon
                    className="!text-brand-text-muted hover:!text-brand-yellow"
                    aria-hidden="true" // Ukrywamy samą ikonę przed syntezatorem, bo label jest na poziomie całego delete action chipa
                  />
                }
                className="!bg-brand-navy !text-brand-text !border !border-brand-navy-light font-mono text-xs uppercase !p-1"
                sx={{
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "var(--color-brand-yellow-hover)",
                  },
                  // Zapewnienie widocznego focusu podczas nawigacji klawiaturą (Tab)
                  "&:focus-visible": {
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