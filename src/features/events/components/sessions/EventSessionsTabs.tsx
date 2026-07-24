"use client";

import React, { useState } from "react";
import { Timer, Car, Flag } from "lucide-react";

import Tabs, { TabItem } from "@/app/_components/Common/Tabs";
import PositionTableCell from "@/app/_components/Common/PositionTableCell";

import { EventDetailsDto } from "../../events.types";

interface EventSessionsTabsProps {
  sessions: EventDetailsDto["sessions"];
  onNavigateVertical?: (direction: "up" | "down") => void;
}

function formatLapTime(ms: number | null): string {
    if (!ms || ms <= 0) return "-";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export default function EventSessionsTabs({ sessions, onNavigateVertical }: EventSessionsTabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (!sessions || sessions.length === 0) return null;

    const currentSession = sessions[activeTab];

    const tabItems: TabItem<number>[] = sessions.map((session, index) => ({
        value: index,
        label: `${session.type} ${session.durationLaps ? `(${session.durationLaps} okr.)` : ""}`,
    }));

    return (
        <section aria-label="Szczegóły sesji wyścigowych" className="space-y-4">
            <Tabs
                items={tabItems}
                value={activeTab}
                onChange={setActiveTab}
                variant="scrollable"
                onNavigateVertical={onNavigateVertical}
            />

            {currentSession && (
                <div className="overflow-x-auto border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] bg-[var(--color-brand-navy-dark)]">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-brand-navy-light)] bg-[var(--color-brand-navy)] text-[var(--color-brand-text-muted)] uppercase tracking-wider">
                                <th scope="col" className="p-3 w-12 text-center">Poz.</th>
                                <th scope="col" className="p-3">Kierowca</th>
                                <th scope="col" className="p-3 text-center">Okrążenia</th>
                                <th scope="col" className="p-3 text-right">Najlepsze okr.</th>
                                <th scope="col" className="p-3 text-right">Czas / Strata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-brand-navy-light)]/50">
                            {currentSession.results.map((res) => (
                                <tr
                                    key={res.driverGuid}
                                    className="hover:bg-[var(--color-brand-navy)]/60 transition-colors duration-150"
                                >
                                    {/* Pozycja na finiszu */}
                                    <PositionTableCell position={res.finish ?? 0} className="p-3 text-center font-bold text-[var(--color-brand-text-muted)]"/>
                                    <td className="p-3 font-bold text-[var(--color-brand-text)] uppercase truncate max-w-[180px]">
                                        {res.driverName}
                                    </td>

                                    {/* Liczba Okrążeń */}
                                    <td className="p-3 text-center text-[var(--color-brand-text)] font-semibold">
                                        {res.laps}
                                    </td>

                                    {/* Najlepszy czas okrążenia */}
                                    <td className="p-3 text-right font-semibold text-[var(--color-brand-yellow-text)]">
                                        <span className="inline-flex items-center gap-1 justify-end">
                                            <Timer className="w-3 h-3 text-[var(--color-brand-yellow-hover)]" />
                                            {formatLapTime(res.bestLap)}
                                        </span>
                                    </td>

                                    {/* Czas Całkowity / Strata */}
                                    <td className="p-3 text-right text-[var(--color-brand-text-muted)]">
                                        {res.gap ? `+${formatLapTime(res.gap)}` : formatLapTime(res.totalTime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}