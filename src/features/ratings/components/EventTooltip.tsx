"use client";

import React from "react";
import { useTranslations, useFormatter } from "next-intl";
import { ChevronUp, ChevronDown } from "lucide-react";

import ComboBadge from "./ComboBadge";

export interface EventTooltipProps {
  active?: boolean;
  payload?: any[];
  guids: string[];
  keyboardRawData?: any;
}

export default function EventTooltip({
  active,
  payload,
  guids,
  keyboardRawData,
}: EventTooltipProps) {
  const tElo = useTranslations("Elo");
  const tDrivers = useTranslations("Drivers");
  const format = useFormatter();

  const hasData = keyboardRawData || (active && payload && payload.length);

  if (!hasData) return null;

  const rawData = keyboardRawData ? keyboardRawData : payload![0].payload;

  return (
    <div
      className="p-3 shadow-2xl text-btn-mono min-w-[230px] z-[100] bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_96%,transparent)] backdrop-blur-md border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]"
    >
      {/* NAZWA WYDARZENIA */}
      <p className="mb-2 font-bold text-center truncate max-w-[240px] uppercase pb-1 text-[var(--color-brand-text-muted)] border-b border-[var(--color-brand-navy-light)]">
        {rawData.eventName}
      </p>

      {/* LISTA KIEROWCÓW W POZYCJI TOOLTIPA */}
      <div className="flex flex-col gap-2">
        {guids.map((guid: string) => {
          const elo = rawData[`elo_${guid}`];
          const meta = rawData[`meta_${guid}`];

          if (elo === undefined || !meta) return null;

          const isGain = meta.eloChange >= 0;

          return (
            <div
              key={guid}
              className="flex flex-col border-l-2 pl-2"
              style={{ borderColor: meta.color }}
            >
              {/* Górny wiersz: Nazwa i aktualne ELO */}
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold truncate max-w-[115px] uppercase text-[var(--color-brand-text)]">
                    {meta.driverName}
                  </span>
                  <ComboBadge combo={meta.combo} erosion={meta.erosion} />
                </div>

                <span className="font-black text-right whitespace-nowrap text-[var(--color-brand-text)]">
                  {format.number(Math.round(elo))} {tDrivers("list.headers.elo")}
                </span>
              </div>

              {/* Dolny wiersz: Status obecności (Emoji) i Zmiana ELO */}
              <div className="flex justify-between items-center text-[11px] tracking-tight mt-0.5">
                <span
                  className={`flex items-center ${
                    meta.hasRaced
                      ? "text-[var(--color-brand-text-muted)] font-normal opacity-60"
                      : "text-[var(--color-brand-yellow-text)] font-bold opacity-100"
                  }`}
                >
                  <span aria-hidden="true" className="mr-1 text-xs">
                    {meta.hasRaced ? "🔴" : "⚪"}
                  </span>
                  {meta.hasRaced
                    ? tElo("chart.status.participated")
                    : tElo("chart.status.skipped")}
                </span>

                {meta.hasRaced && (
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      isGain
                        ? "text-[var(--color-elo-gain)]"
                        : "text-[var(--color-elo-loss)]"
                    }`}
                  >
                    {/* Ikona dostosowana dla WCAG z Lucide */}
                    {isGain ? (
                      <ChevronUp className="w-4 h-4 -mr-0.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 -mr-0.5" aria-hidden="true" />
                    )}

                    <span>
                      {isGain
                        ? `${format.number(meta.eloChange)}`
                        : format.number(-1 * meta.eloChange)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}