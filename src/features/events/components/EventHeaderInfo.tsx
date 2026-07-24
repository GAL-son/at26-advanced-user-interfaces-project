"use client";

import React from "react";
import { Flag, Calendar, Server, Trophy, Users } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

import { EventDetailsDto } from "../events.types";

interface EventHeaderInfoProps {
  event: EventDetailsDto;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function EventHeaderInfo({
  event,
  onNavigateVertical,
}: EventHeaderInfoProps) {
  const t = useTranslations("Results.info");
  const format = useFormatter();

  const formattedDate = event.date
    ? format.dateTime(new Date(event.date), {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const readableTrack = event.track ? event.track.replace(/_/g, " ") : "-";
  const serverUrl = event.server?.startsWith("http")
    ? event.server
    : `https://${event.server}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("down");
    } else if (e.key === "ArrowUp" && onNavigateVertical) {
      e.preventDefault();
      onNavigateVertical("up");
    }
  };

  return (
    <section
      aria-labelledby="event-title"
      className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-[var(--color-brand-navy-dark)] to-[color-mix(in_srgb,var(--color-brand-navy-dark)_80%,black)] border-l-4 border-l-[var(--color-brand-yellow)] border-t border-r border-b border-[var(--color-brand-navy-light)] rounded-r-xl rounded-l-sm shadow-xl"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* LEWA STRONA: Nazwa wydarzenia i Tor */}
        <div className="space-y-2 min-w-0 flex-1">
          <h1
            id="event-title"
            className="text-2xl sm:text-3xl font-black tracking-tight uppercase truncate text-[var(--color-brand-text)]"
          >
            {event.name || t("unnamedEvent")}
          </h1>

          <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider font-semibold text-[var(--color-brand-yellow-text)]">
            <Flag className="w-4 h-4 text-[var(--color-brand-yellow-hover)] shrink-0" />
            <span className="truncate">
              {t("track")}: {readableTrack}
            </span>
          </div>
        </div>

        {/* PRAWA STRONA: Kafelki (Data i Serwer) */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
          
          {/* Kafelek: Data */}
          <div className="rounded-lg p-3 flex items-center gap-3 w-full sm:w-[220px] bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)]">
            <div className="p-2 rounded shrink-0 bg-[color-mix(in_srgb,var(--color-brand-text-muted)_12%,transparent)] text-[var(--color-brand-text-muted)]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 text-[var(--color-brand-text-muted)] font-mono">
                {t("raceDate")}
              </span>
              <span className="text-sm font-medium font-mono truncate text-[var(--color-brand-text)]">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Kafelek: Serwer */}
          {event.server && (
            <a
              href={serverUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("joinServer")}: ${event.server}`}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="group rounded-lg p-3 flex items-center gap-3 w-full sm:w-[220px] bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] transition-all no-underline focus-brand hover:border-[var(--color-brand-yellow-hover)]"
            >
              <div className="p-2 rounded shrink-0 bg-[color-mix(in_srgb,var(--color-brand-text-muted)_12%,transparent)] text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-text)] transition-colors duration-200">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 w-full">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-text)] transition-colors duration-200 font-mono">
                  {t("serverStatus")}
                </span>
                <span className="text-xs font-mono truncate text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-text)] group-hover:underline transition-colors duration-200">
                  {event.server}
                </span>
              </div>
            </a>
          )}

        </div>
      </div>

      {/* SEKCJA STATYSTYK WYDARZENIA */}
      {event.stats && (
        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[var(--color-brand-navy-light)]">
          
          <div className="p-3 bg-[var(--color-brand-navy)]/60 border border-[var(--color-brand-navy-light)]/50 rounded-[var(--radius-brand-card)] flex items-center gap-3">
            <div className="p-2 rounded shrink-0 bg-[color-mix(in_srgb,var(--color-brand-yellow-hover)_12%,transparent)] text-[var(--color-brand-yellow-hover)]">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--color-brand-text-muted)]">
                {t("stats.racesCount")}
              </span>
              <span className="text-lg font-bold font-mono text-[var(--color-brand-text)]">
                {format.number(event.stats.racesCount)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[var(--color-brand-navy)]/60 border border-[var(--color-brand-navy-light)]/50 rounded-[var(--radius-brand-card)] flex items-center gap-3">
            <div className="p-2 rounded shrink-0 bg-[color-mix(in_srgb,var(--color-brand-yellow-hover)_12%,transparent)] text-[var(--color-brand-yellow-hover)]">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--color-brand-text-muted)]">
                {t("stats.uniqueDrivers")}
              </span>
              <span className="text-lg font-bold font-mono text-[var(--color-brand-text)]">
                {format.number(event.stats.uniqueDriversCount)}
              </span>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}