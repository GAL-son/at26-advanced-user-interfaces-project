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
    const iconClass = "text-[var(--color-brand-yellow-hover)] text-2xl sm:text-3xl";
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
      className="w-full bg-[var(--color-brand-navy-dark)]/20 rounded-xl p-6 border border-[var(--color-brand-navy-light)]/40 flex-1"
      aria-label={t("stats.ariaLabel")}
    >
      <dl className="flex flex-col gap-4 m-0 p-0 h-full justify-between">
        {statItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)]/40 shadow-sm flex-1"
          >
            {/* Dekoracyjny kontener ikony w pełni ukryty przed czytnikami ekranu */}
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] shrink-0"
              aria-hidden="true"
            >
              {renderIcon(item.iconType)}
            </div>

            {/* Kontener tekstowy z parą definicji */}
            <div className="flex flex-col min-w-0 flex-1">
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