import HomePage from "@/app/_pages/HomePage";
import { getRecentlyActiveDrivers, getDriversList } from "@/lib/services/drivers";
import { getLatestEvents } from "@/lib/services/events";
import { getVirtualDuels } from "@/lib/services/duels"; // <-- Nowy import

export const revalidate = 60;

export default async function Page() {
  const [activeDrivers, latestEvents, leaderboardData, virtualDuels] = await Promise.all([
    getRecentlyActiveDrivers({ sinceParam: '14d', limitParam: 15 }),
    getLatestEvents(2),
    getDriversList({ page: 0, limit: 5, sortBy: 'elo' }),
    getVirtualDuels() // <-- Pobieranie pojedynków z serwisu
  ]);

  return (
    <HomePage 
      activeDrivers={activeDrivers} 
      latestEvents={latestEvents} 
      topDrivers={leaderboardData.drivers} 
      dashboardDuels={virtualDuels} // <-- Przekazanie do strony
    />
  );
}