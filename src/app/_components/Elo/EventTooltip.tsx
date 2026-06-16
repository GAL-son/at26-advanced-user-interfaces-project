"use client";

import React from 'react';
import ComboBadge from "./ComboBadge";
import { Box } from "@mui/material";
import { useTranslations, useFormatter } from "next-intl";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface EventTooltipProps {
  active?: boolean;
  payload?: any[];
  guids: string[];
  keyboardRawData?: any;
}

export default function EventTooltip({ active, payload, guids, keyboardRawData }: EventTooltipProps) {
  const tElo = useTranslations("Elo");
  const tDrivers = useTranslations("Drivers");
  const format = useFormatter();

  const hasData = keyboardRawData || (active && payload && payload.length);
  
  if (hasData) {
    const rawData = keyboardRawData ? keyboardRawData : payload![0].payload;

    return (
      <Box 
        /* POPRAWKA: Pełny token monospaced dla zachowania wyścigowego HUD */
        className="p-3 shadow-2xl !text-btn-mono min-w-[230px] z-[100]"
        sx={{
          backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-dark) 96%, transparent)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-brand-navy-light)',
          borderRadius: 'var(--radius-brand-card)',
        }}
      >
        {/* NAZWA WYDARZENIA */}
        <p 
          className="mb-2 font-bold text-center truncate max-w-[240px] uppercase pb-1"
          style={{ 
            color: 'var(--color-brand-text-muted)',
            borderBottom: '1px solid var(--color-brand-navy-light)'
          }}
        >
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
                    <span 
                      className="font-bold truncate max-w-[115px] uppercase"
                      style={{ color: 'var(--color-brand-text)' }}
                    >
                      {meta.driverName}
                    </span>
                    {meta.combo > 1 && <ComboBadge combo={meta.combo} />}
                  </div>
                  
                  <span 
                    className="font-black text-right whitespace-nowrap"
                    style={{ color: 'var(--color-brand-text)' }}
                  >
                    {format.number(Math.round(elo))} {tDrivers("list.headers.elo")}
                  </span>
                </div>

                {/* Dolny wiersz: Status obecności (Emoji) i Zmiana ELO (MUI Ikona dla WCAG) */}
                <div className="flex justify-between items-center text-[11px] tracking-tight mt-0.5">
                  <span 
                    className="flex items-center"
                    style={{ 
                      color: meta.hasRaced ? 'var(--color-brand-text-muted)' : 'var(--color-brand-yellow-text)',
                      fontWeight: meta.hasRaced ? 'normal' : 'bold',
                      opacity: meta.hasRaced ? 0.6 : 1
                    }}
                  >
                    {/* ZACHOWANE EMOJI: Jasna identyfikacja kształtu (pełne vs puste) */}
                    <span aria-hidden="true" className="mr-1 text-xs">
                      {meta.hasRaced ? "🔴" : "⚪"}
                    </span>
                    {meta.hasRaced ? tElo("chart.status.participated") : tElo("chart.status.skipped")}
                  </span>
                  
                  {meta.hasRaced && (
                    <span 
                      className="font-bold flex items-center gap-0.5"
                      style={{ 
                        color: isGain ? 'var(--color-elo-gain)' : 'var(--color-elo-loss)' 
                      }}
                    >
                      {/* POPRAWKA WCAG: Zróżnicowane kształtem ikony MUI zamiast surowego tekstu */}
                      {isGain ? (
                        <ArrowDropUpIcon className="!text-base -mr-1" aria-hidden="true" />
                      ) : (
                        <ArrowDropDownIcon className="!text-base -mr-1" aria-hidden="true" />
                      )}
                      
                      <span>
                        {isGain 
                          ? `${format.number(meta.eloChange)}` 
                          : format.number(-1 * meta.eloChange)
                        }
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  }
  return null;
}