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
  "socials",
];

export default function HomePage({ activeDrivers, latestEvents, topDrivers, virtualDuels, globalStats }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)]">
      
      {/* SEKCJA: ticker */}
      <div data-section="ticker" data-section-page-start="true">
        <ActiveDriversTicker
          drivers={activeDrivers}
          scrollSpeed={0.5}
          // Przekazujemy SECTION_ORDER jako trzeci argument:
          onNavigateVertical={(dir) => focusFlatSection("ticker", dir, SECTION_ORDER)}
        />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-8">
        
        {/* SEKCJA: events */}
        {latestEvents && latestEvents.length > 0 && (
          <div data-section="events" className="w-full">
            <LatestEventsSection 
              events={latestEvents}
              onNavigateVertical={(dir) => focusFlatSection("events", dir, SECTION_ORDER)} 
            />
          </div>
        )}

        {/* SEKCJA DWUKOLUMNOWA 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">          
          <div data-section="leaderboard" className="w-full">
            <TopDriversLeaderboard 
              drivers={topDrivers} 
              onNavigateHorizontal={(dir) => focusFlatSection("leaderboard", dir, SECTION_ORDER)}
              // onNavigateVertical={(dir) => focusFlatSection("leaderboard", dir, SECTION_ORDER)}
            />
          </div>
          
          {virtualDuels && (virtualDuels.top || virtualDuels.midfield || virtualDuels.rookies) && (
            <div data-section="duels" className="w-full flex">
              <VirtualDuelsSection 
                duels={virtualDuels} 
                onNavigateHorizontal={(dir) => focusFlatSection("duels", dir, SECTION_ORDER)}
                // onNavigateVertical={(dir) => focusFlatSection("duels", dir, SECTION_ORDER)}
              />
            </div>
          )}
        </div>

        {/* SEKCJA DWUKOLUMNOWA 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">          
          <div data-section="socials" className="w-full">
            <SocialsAndServers 
              onNavigateHorizontal={(dir) => focusFlatSection("socials", dir, SECTION_ORDER)}
              onNavigateVertical={(dir) => focusFlatSection("socials", dir, SECTION_ORDER)}
            />
          </div>
          
          <div data-section="stats" className="w-full flex">
            <GlobalStatsSection 
              stats={globalStats}
            />
          </div>
        </div>

      </main>
    </div>
  );
}