// src/app/page.tsx
"use client";

import React from "react";
import ActiveDriversTicker from "@/app/_components/Home/ActiveDriversTicker";
import LatestEventsSection from "@/app/_components/Home/LatestEventsSection";
import TopDriversLeaderboard from "@/app/_components/Home/TopDriversLeaderboard";
import VirtualDuelsSection from "@/app/_components/Home/VirtualDuelsSection";
import { focusFlatSection } from "@/app/_utils/navigation";
import SocialsAndServers from "../_components/Socials/SocialsAndServers";
import GlobalStatsSection from "../_components/Home/GlobalStatsSection";

import { ExtendedDriver, TickerDriver } from "@/lib/services/drivers";
import { FormattedEvent } from "@/lib/services/events";
import { DashboardDuels } from "@/lib/services/duels";
import { GlobalStats } from "@/lib/services/stats";
import { usePageInitialFocus } from "../_hooks/usePageInitialFocus";

interface HomePageProps {
  activeDrivers: TickerDriver[];
  latestEvents: FormattedEvent[];
  topDrivers: ExtendedDriver[];
  virtualDuels: DashboardDuels;
  globalStats: GlobalStats;
}

const SECTION_ORDER = [
  "menu",
  "ticker",
  "events",
  "leaderboard",
  "duels",
  "footer"
];

export default function HomePage({ activeDrivers, latestEvents, topDrivers, virtualDuels, globalStats }: HomePageProps) {
  usePageInitialFocus();

  return (
    <div className="flex flex-col min-h-screen bg-brand-navy">

      {/* SEKCJA: ticker */}
      <div data-section="ticker" data-section-page-start="true">
        <ActiveDriversTicker
          drivers={activeDrivers}
          scrollSpeed={0.5}
          onNavigateVertical={(dir) => focusFlatSection("ticker", dir, SECTION_ORDER)}
        />
      </div>

      {/* ZMIANA: Zmniejszono py-6 -> py-4 oraz gap-8 -> gap-4 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">

        {/* SEKCJA: events */}
        {latestEvents && latestEvents.length > 0 && (
          <div data-section="events" className="w-full">
            <LatestEventsSection
              events={latestEvents}
              onNavigateVertical={(dir) => focusFlatSection("events", dir, SECTION_ORDER)}
            />
          </div>
        )}

        {/* SEKCJA DWUKOLUMNOWA 1 (ZMIANA: gap-6 -> gap-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div data-section="leaderboard" className="w-full">
            <TopDriversLeaderboard
              drivers={topDrivers}
              onNavigateHorizontal={(dir) => focusFlatSection("leaderboard", dir, SECTION_ORDER)}
            />
          </div>

          {virtualDuels && (virtualDuels.top || virtualDuels.midfield || virtualDuels.rookies) && (
            <div data-section="duels" className="w-full flex">
              <VirtualDuelsSection
                duels={virtualDuels}
                onNavigateHorizontal={(dir) => focusFlatSection("duels", dir, SECTION_ORDER)}
              />
            </div>
          )}
        </div>

        <div data-section="stats" className="w-full flex">
          <GlobalStatsSection
            stats={globalStats}
          />
        </div>

      </main>
    </div>
  );
}