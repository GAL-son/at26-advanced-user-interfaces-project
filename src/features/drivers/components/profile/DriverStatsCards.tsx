"use client";

import React from "react";
import { useTranslations, useFormatter } from "next-intl";
import {
    TrendingUp,
    Trophy,
    Calendar,
    UserPlus,
    Flag,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Award
} from "lucide-react";

import ComboBadge from "@/features/ratings/components/ComboBadge";

import { DriverDetailsDto } from "../../drivers.types";
import HeroCard from "@/components/common/HeroCard";

interface DriverStatsCardsProps {
    driver: DriverDetailsDto;
}

export default function DriverStatsCards({ driver }: DriverStatsCardsProps) {
    const t = useTranslations("Drivers");
    const format = useFormatter();

    const formattedSyncDate = driver.lastActive
        ? format.dateTime(new Date(driver.lastActive), {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : t("list.notAvailable");

    const formattedJoinedDate = driver.joined
        ? format.dateTime(new Date(driver.joined), {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : t("list.notAvailable");

    const avgPositionsGained = driver.stats.avgPositionsGained;
    const positionsGainedFormatted =
        avgPositionsGained !== null
            ? `${avgPositionsGained > 0 ? "+" : ""}${format.number(avgPositionsGained, { maximumFractionDigits: 1 })}`
            : t("list.notAvailable");

    return (

        <HeroCard aria-label={t("profile.statsSummary")} className="space-y-4">
            <article className="flex flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-page-title uppercase leading-tight shrink-0 text-[var(--color-brand-text)]">
                        {driver.mainName}
                    </h1>
                    {driver.altNames && driver.altNames !== driver.mainName && (
                        <p className="text-btn-mono mt-1 uppercase text-[var(--color-brand-text-muted)] opacity-70">
                            {t("list.aliases")}: {driver.altNames}
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                    {/* Główny wynik ELO */}
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="p-4 rounded-xl shrink-0 bg-[color-mix(in_srgb,var(--color-brand-yellow-hover)_15%,transparent)] text-[var(--color-brand-yellow-hover)] border border-[color-mix(in_srgb,var(--color-brand-yellow-hover)_30%,transparent)]"
                        >
                            <TrendingUp className="w-10 h-10" />
                        </div>
                        <div className="flex-col items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <p className="text-4xl font-extrabold tracking-tight text-[var(--color-brand-text)] mt-1 font-mono">
                                    {format.number(Math.round(driver.currentRating || 0))}
                                </p>
                                <ComboBadge combo={driver.combo} erosion={driver.erosion} />
                            </div>

                            <span className="text-xs text-[var(--color-brand-text-muted)] flex items-center gap-1.5 uppercase font-mono">
                                <Award className="w-4 h-4 text-[var(--color-race-gold)]" />
                                <span className="text-xl font-bold font-mono text-[var(--color-race-gold)] mt-0.5">
                                    {format.number(Math.round(driver.bestRating || 0))}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </article>

            {/* SEKCJA 2: STATYSTYKI WYŚCIGOWE (Siatka 4 kart) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                {/* Liczba Wyścigów */}
                <article className="p-4 bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase text-[var(--color-brand-text-muted)] font-mono opacity-80 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        {t("profile.totalExperience")}
                    </span>
                    <p className="text-2xl font-bold font-mono text-[var(--color-brand-text)] mt-2">
                        {format.number(driver.stats.eventsCount)}{" "}
                        <span className="text-xs font-normal text-[var(--color-brand-text-muted)]">
                            {t("profile.racesUnit")}
                        </span>
                    </p>
                </article>

                {/* Średnia Kwalifikacji */}
                <article className="p-4 bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase text-[var(--color-brand-text-muted)] font-mono opacity-80 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {t("profile.avgQuali")}
                    </span>
                    <p className="text-2xl font-bold font-mono text-[var(--color-brand-text)] mt-2">
                        {driver.stats.avgQualiPosition !== null
                            ? `P${format.number(driver.stats.avgQualiPosition, { maximumFractionDigits: 1 })}`
                            : t("list.notAvailable")}
                    </p>
                </article>

                {/* Średni Finisz */}
                <article className="p-4 bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase text-[var(--color-brand-text-muted)] font-mono opacity-80 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" />
                        {t("profile.avgFinish")}
                    </span>
                    <p className="text-2xl font-bold font-mono text-[var(--color-brand-text)] mt-2">
                        {driver.stats.avgFinishPosition !== null
                            ? `P${format.number(driver.stats.avgFinishPosition, { maximumFractionDigits: 1 })}`
                            : t("list.notAvailable")}
                    </p>
                </article>

                {/* Zyskane / Stracone Pozycje */}
                <article className="p-4 bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase text-[var(--color-brand-text-muted)] font-mono opacity-80 flex items-center gap-1.5">
                        {avgPositionsGained && avgPositionsGained > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-elo-gain)]" />
                        ) : avgPositionsGained && avgPositionsGained < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-[var(--color-elo-loss)]" />
                        ) : (
                            <Minus className="w-3.5 h-3.5" />
                        )}
                        {t("profile.avgPositionsGained")}
                    </span>
                    <p className={`text-2xl font-bold font-mono mt-2 ${avgPositionsGained && avgPositionsGained > 0
                        ? "text-[var(--color-elo-gain)]"
                        : avgPositionsGained && avgPositionsGained < 0
                            ? "text-[var(--color-elo-loss)]"
                            : "text-[var(--color-brand-text)]"
                        }`}>
                        {positionsGainedFormatted}
                    </p>
                </article>

            </div>

            {/* SEKCJA 3: METADANE (Dyskretne informacje o koncie) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <article className="px-4 py-3 bg-[var(--color-brand-navy-dark)]/60 border border-[var(--color-brand-navy-light)]/50 rounded-[var(--radius-brand-card)] flex items-center justify-between text-xs">
                    <span className="text-[var(--color-brand-text-muted)] font-mono flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-70" />
                        {t("profile.lastSync")}
                    </span>
                    <span className="font-semibold text-[var(--color-brand-text)]">
                        {formattedSyncDate}
                    </span>
                </article>

                <article className="px-4 py-3 bg-[var(--color-brand-navy-dark)]/60 border border-[var(--color-brand-navy-light)]/50 rounded-[var(--radius-brand-card)] flex items-center justify-between text-xs">
                    <span className="text-[var(--color-brand-text-muted)] font-mono flex items-center gap-2">
                        <UserPlus className="w-4 h-4 opacity-70" />
                        {t("profile.joinedDate")}
                    </span>
                    <span className="font-semibold text-[var(--color-brand-text)]">
                        {formattedJoinedDate}
                    </span>
                </article>
            </div>

        </HeroCard>
    );
}