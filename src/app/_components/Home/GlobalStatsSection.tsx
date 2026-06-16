"use client";

import React from "react";
import { useTranslations, useFormatter } from "next-intl";
import { GlobalStats } from "@/lib/services/stats";
import PeopleIcon from "@mui/icons-material/People";
import FlagIcon from "@mui/icons-material/Leaderboard";
import SpeedIcon from "@mui/icons-material/Speed";

interface GlobalStatsSectionProps {
  stats: GlobalStats;
}

export default function GlobalStatsSection({ stats }: GlobalStatsSectionProps) {
  const t = useTranslations("Home");
  const format = useFormatter();

  const statItems = [
    {
      id: "stats-drivers",
      label: t("stats.registeredDrivers"),
      value: format.number(stats.totalDrivers),
      iconType: "drivers",
    },
    {
      id: "stats-events",
      label: t("stats.totalRaces"),
      value: format.number(stats.totalEvents),
      iconType: "races",
    },
    {
      id: "stats-elo",
      label: t("stats.averageElo"),
      value: format.number(stats.averageElo),
      iconType: "elo",
    },
  ];

  const renderIcon = (type: string) => {
    // Migracja ikony na czyste klasy kolorów Tailwind v4
    const iconClass = "text-brand-yellow-hover text-2xl sm:text-3xl";
    switch (type) {
      case "drivers":
        return <PeopleIcon className={iconClass} />;
      case "races":
        return <FlagIcon className={iconClass} />;
      case "elo":
        return <SpeedIcon className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <section 
      // Usunięcie arbitralnych zmiennych var() z kontenera sekcji
      className="w-full bg-brand-navy-dark/20 rounded-xl p-6 border border-brand-navy-light/40 flex-1"
      aria-label={t("stats.ariaLabel")}
    >
      <dl className="flex flex-col gap-4 m-0 p-0 h-full justify-between">
        {statItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 rounded-lg bg-brand-navy-dark border border-brand-navy-light/40 shadow-sm flex-1"
          >
            {/* Dekoracyjny kontener ikony w wersji Tailwind v4 */}
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand-navy border border-brand-navy-light shrink-0"
              aria-hidden="true"
            >
              {renderIcon(item.iconType)}
            </div>

            {/* Kontener tekstowy z parą definicji */}
            <div className="flex flex-col min-w-0 flex-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted opacity-80 truncate">
                {item.label}
              </dt>
              {/* Zmiana na ujednolicony token !text-stat-value dla czytelnych, dużych danych liczbowych */}
              <dd className="text-brand-text m-0 mt-0.5 !text-stat-value">
                {item.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}