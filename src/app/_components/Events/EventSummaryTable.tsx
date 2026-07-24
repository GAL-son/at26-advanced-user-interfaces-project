"use client";

import React from "react";
import { DriverEventSummaryDto } from "@/lib/services/events.service"; // Dostosuj ścieżkę do typów
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import PositionTableCell from "../Common/PositionTableCell";

interface EventSummaryTableProps {
    results: DriverEventSummaryDto[];
}

export default function EventSummaryTable({ results }: EventSummaryTableProps) {
    const t = useTranslations("Results.summary");

    if (!results || results.length === 0) return null;

    // Ustalamy maksymalną liczbę wyścigów, aby stworzyć odpowiednią liczbę kolumn w tabeli
    const maxRaces = Math.max(...results.map((r) => r.races.length), 0);

    return (
        <section aria-label="Podsumowanie wyników wydarzenia" className="space-y-3">
            <h2 className="text-btn-mono uppercase font-bold text-[var(--color-brand-text-muted)] text-xs tracking-wider">
                {t("header")}
            </h2>

            <div className="overflow-x-auto border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] bg-[var(--color-brand-navy-dark)]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--color-brand-navy-light)] bg-[var(--color-brand-navy)] text-[var(--color-brand-text-muted)] uppercase tracking-wider">
                            <th scope="col" className="p-3">{t("driver")}</th>
                            <th scope="col" className="p-3">{t("car")}</th>
                            <th scope="col" className="p-3 text-center">{t("quali")}</th>

                            {Array.from({ length: maxRaces }).map((_, index) => (
                                <th key={index} scope="col" className="p-3 text-center">
                                    {t("race")}{index + 1}
                                </th>
                            ))}

                            <th scope="col" className="p-3 text-right">{t("rating")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-brand-navy-light)]/50">
                        {results.map((driver, index) => {
                            const eloChange = driver.rating?.change ?? 0;

                            return (
                                <tr
                                    key={driver.driverGuid}
                                    className="hover:bg-[var(--color-brand-navy)]/60 transition-colors duration-150"
                                >
                                    <td className="p-3 font-bold text-[var(--color-brand-text)] uppercase truncate max-w-[180px]">
                                        {driver.driverName}
                                    </td>

                                    <td className="p-3 font-bold text-[var(--color-brand-text)] uppercase truncate max-w-[180px]">
                                        {driver.car}
                                    </td>

                                    <td className="p-3 text-center text-[var(--color-brand-text-muted)]">
                                        {driver.quali?.finish ? `P${driver.quali.finish}` : "-"}
                                    </td>

                                    {Array.from({ length: maxRaces }).map((_, rIndex) => {
                                        const race = driver.races[rIndex];
                                        if (!race || race.finish === null) {
                                            return (
                                                <td key={rIndex} className="p-3 text-center text-[var(--color-brand-text-muted)]/40">
                                                    -
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={rIndex} className="p-3 text-center font-semibold">
                                                <span className="text-[var(--color-brand-text)]">P{race.finish}</span>
                                                {race.positionChange !== null && race.positionChange !== 0 && (
                                                    <span
                                                        className={`ml-1 text-[10px] ${race.positionChange > 0
                                                                ? "text-[var(--color-elo-gain)]"
                                                                : "text-[var(--color-elo-loss)]"
                                                            }`}
                                                    >
                                                        ({race.positionChange > 0 ? `+${race.positionChange}` : race.positionChange})
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}


                                    <td className="p-3 text-right font-bold text-[var(--color-brand-text)]">
                                        {driver.rating ? Math.round(driver.rating.after) : "-"}
                                        {driver.rating ? (
                                            <span
                                                className={`inline-flex items-center justify-end gap-0.5 ${eloChange > 0
                                                        ? "text-[var(--color-elo-gain)]"
                                                        : eloChange < 0
                                                            ? "text-[var(--color-elo-loss)]"
                                                            : "text-[var(--color-brand-text-muted)]"
                                                    }`}
                                            >
                                                {eloChange > 0 ? (
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                ) : eloChange < 0 ? (
                                                    <TrendingDown className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Minus className="w-3.5 h-3.5" />
                                                )}
                                                {eloChange > 0 ? `+${Math.round(eloChange)}` : Math.round(eloChange)}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}