"use client";

import React from "react";
import { GlobalStats } from "@/lib/services/stats";
import PeopleIcon from "@mui/icons-material/People";
import FlagIcon from "@mui/icons-material/Leaderboard";
import SpeedIcon from "@mui/icons-material/Speed";

interface GlobalStatsSectionProps {
  stats: GlobalStats;
}

export default function GlobalStatsSection({ stats }: GlobalStatsSectionProps) {
  const statItems = [
    {
      id: "stats-drivers",
      label: "Zarejestrowani Kierowcy",
      value: stats.totalDrivers.toLocaleString("pl-PL"),
      icon: <PeopleIcon className="text-[var(--color-brand-yellow-hover)] text-2xl sm:text-3xl" />,
    },
    {
      id: "stats-events",
      label: "Rozegrane Wyścigi",
      value: stats.totalEvents.toLocaleString("pl-PL"),
      icon: <FlagIcon className="text-[var(--color-brand-yellow-hover)] text-2xl sm:text-3xl" />,
    },
    {
      id: "stats-elo",
      label: "Średnie ELO Stawki",
      value: stats.averageElo,
      icon: <SpeedIcon className="text-[var(--color-brand-yellow-hover)] text-2xl sm:text-3xl" />,
    },
  ];

  return (
    <section 
      className="w-full bg-[var(--color-brand-navy-dark)]/20 rounded-xl p-6 border border-[var(--color-brand-navy-light)]/40 flex-1"
      aria-label="Ogólne statystyki platformy"
    >
      {/* Zmiana z grid-cols-3 na flex flex-col dla układu wertykalnego */}
      <dl className="flex flex-col gap-4 m-0 p-0 h-full justify-between">
        {statItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/40 shadow-sm flex-1"
          >
            {/* Ikona */}
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] shrink-0">
              {item.icon}
            </div>

            {/* Teksty */}
            <div className="flex flex-col min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80 truncate">
                {item.label}
              </dt>
              <dd className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-brand-text)] m-0 mt-0.5 font-mono">
                {item.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}