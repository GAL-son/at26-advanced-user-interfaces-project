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
}

export default function SelectedDriversList({ drivers, onRemove }: SelectedDriversListProps) {
  const t = useTranslations("CompareDrivers.search");

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
          drivers.map((driver) => (
            <div key={driver.guid} role="listitem">
              <Chip
                label={`${driver.mainName} ${driver.currentElo ? `(${Math.round(driver.currentElo)})` : ""}`}
                onDelete={() => onRemove(driver.guid)}
                // 🌐 Dynamiczna interpolacja parametrów i18n gwarantuje poprawną składnię w każdym języku
                aria-label={t("driverChipAriaLabel", { driverName: driver.mainName })}
                deleteIcon={
                  <CloseIcon
                    className="!text-brand-text-muted hover:!text-brand-yellow"
                    aria-hidden="true"
                  />
                }
                className="!bg-brand-navy !text-brand-text !border !border-brand-navy-light font-mono text-xs uppercase !p-1"
                sx={{
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "var(--color-brand-yellow-hover)",
                  },
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