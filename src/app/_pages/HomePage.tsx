import ActiveDriversTicker from "@/app/_components/Home/ActiveDriversTicker";
import LatestEventsSection from "@/app/_components/Home/LatestEventsSection";
import { ExtendedDriver, TickerDriver } from "@/lib/services/drivers";
import { FormattedEvent } from "@/lib/services/events";
import TopDriversLeaderboard from "../_components/Home/TopDriversLeaderboard";
import { DashboardDuels } from "@/lib/services/duels";
import VirtualDuelsSection from "../_components/Home/VirtualDuelsSection";

interface HomePageProps {
  activeDrivers: TickerDriver[];
  latestEvents: FormattedEvent[];
  topDrivers: ExtendedDriver[];
  dashboardDuels: DashboardDuels;
}

export default function HomePage({ activeDrivers, latestEvents, topDrivers, dashboardDuels }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)]">
      {/* Ticker z aktywnymi graczami */}
      <ActiveDriversTicker drivers={activeDrivers} scrollSpeed={0.5}/>
      
      {/* Główna sekcja strony */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sekcja ostatnich 2 eventów */}
        <LatestEventsSection events={latestEvents} />
        
        {/* Miejsce na kolejne komponenty strony głównej */}
        <TopDriversLeaderboard drivers={topDrivers} />
        <VirtualDuelsSection duels={dashboardDuels} />
      </main>
    </div>
  );
}