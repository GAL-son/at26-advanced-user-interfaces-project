"use client";
import React from 'react';
import ComboBadge from "./ComboBadge";
import { Box } from "@mui/material";
import { useTranslations, useFormatter } from "next-intl";

export interface EventTooltipProps {
  active?: boolean;
  payload?: any[];
  guids: string[];
}

export default function EventTooltip({ active, payload, guids }: EventTooltipProps) {
  // Pobieramy tłumaczenia z namespace "Elo" dla spójności danych wykresu
  const tElo = useTranslations("Elo");
  const tDrivers = useTranslations("Drivers");
  const format = useFormatter();

  if (active && payload && payload.length) {
    const rawData = payload[0].payload;

    return (
      <Box 
        className="p-3 shadow-2xl font-mono text-xs min-w-[220px] z-[100]"
        sx={{
          backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-dark) 96%, transparent)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-brand-navy-light)',
          borderRadius: 'var(--radius-brand-card)',
        }}
      >
        {/* NAZWA WYDARZENIA */}
        <p 
          className="mb-2 font-bold text-center truncate max-w-[240px]"
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
                      className="font-bold truncate max-w-[115px]"
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

                {/* Dolny wiersz: Status obecności i zmiana ELO */}
                <div className="flex justify-between items-center text-[10px]">
                  <span 
                    style={{ 
                      color: meta.hasRaced ? 'var(--color-brand-text-muted)' : 'var(--color-brand-yellow-text)',
                      fontWeight: meta.hasRaced ? 'normal' : 'bold',
                      opacity: meta.hasRaced ? 0.6 : 1
                    }}
                  >
                    <span aria-hidden="true" className="mr-1">
                      {meta.hasRaced ? "🔴" : "⚪"}
                    </span>
                    {meta.hasRaced ? tElo("chart.status.participated") : tElo("chart.status.skipped")}
                  </span>
                  
                  {meta.hasRaced && (
                    <span 
                      className="font-bold flex items-center"
                      style={{ 
                        color: isGain ? 'var(--color-elo-gain)' : 'var(--color-elo-loss)' 
                      }}
                    >
                      <span aria-hidden="true" className="mr-0.5 text-[8px]">
                        {isGain ? "▲" : "▼"}
                      </span>
                      {isGain 
                        ? `+${format.number(meta.eloChange)}` 
                        : format.number(meta.eloChange)
                      }
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