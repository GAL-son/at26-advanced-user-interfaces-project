import ActiveDriversTicker from "@/app/_components/Home/ActiveDriversTicker";
import LatestEventsSection from "@/app/_components/Home/LatestEventsSection";
import TopDriversLeaderboard from "@/app/_components/Home/TopDriversLeaderboard";
import VirtualDuelsSection from "@/app/_components/Home/VirtualDuelsSection";
import GlobalStatsSection from "@/app/_components/Home/GlobalStatsSection";
import SocialsAndServers from "../_components/Socials/SocialsAndServers";

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

export default function HomePage({
  activeDrivers,
  latestEvents,
  topDrivers,
  virtualDuels,
  globalStats,
}: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)]">
      {/* Ticker z aktywnymi graczami na samej górze */}
      <ActiveDriversTicker drivers={activeDrivers} scrollSpeed={0.5} />

      {/* Główna sekcja strony */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* SEKCJA 1: Ostatnie eventy (Pełna szerokość) */}
        <div className="w-full">
          <LatestEventsSection events={latestEvents} />
        </div>

        {/* SEKCJA 2: Top Drivers (Lewo) i Duels (Prawo) */}
        {/* SEKCJA 2: Top Drivers (Lewo) i Duels (Prawo) */}
        {/* Zmieniono items-start na items-stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="w-full">
            <TopDriversLeaderboard drivers={topDrivers} />
          </div>
          {/* Dodano flex i h-full, aby sekcja zajęła 100% wysokości grida */}
          <div className="w-full flex">
            <VirtualDuelsSection duels={virtualDuels} />
          </div>
        </div>

        {/* SEKCJA 3: Globalne Statystyki (Lewo) i Linki/Serwery (Prawo) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="w-full flex">
            <GlobalStatsSection stats={globalStats} />
          </div>
          <div className="w-full flex">
            {/* Usunąłem stąd wewnętrzny mt-6 za pomocą modyfikacji w komponencie lub nadpisania, jeśli zajdzie potrzeba dostosowania marginesów */}
            <div className="w-full mt-0">
              <SocialsAndServers />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
