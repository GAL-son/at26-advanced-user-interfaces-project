import HomePage from "@/app/_pages/HomePage";
import { getRecentlyActiveDrivers, getDriversList } from "@/lib/services/drivers";
import { getLatestEvents } from "@/lib/services/events";
import { getVirtualDuels } from "@/lib/services/duels";
import { getGlobalStats } from "@/lib/services/stats"; // <-- Import serwisu statystyk

export const revalidate = 60; // Cache na 60 sekund

export default async function Page() {
  const [
    activeDrivers, 
    latestEvents, 
    leaderboardData, 
    virtualDuels,
    globalStats // <-- Nowe dane
  ] = await Promise.all([
    getRecentlyActiveDrivers({ sinceParam: '14d', limitParam: 15 }),
    getLatestEvents(2),
    getDriversList({ page: 0, limit: 5, sortBy: 'elo' }),
    getVirtualDuels(),
    getGlobalStats()
  ]);

  return (
    <HomePage 
      activeDrivers={activeDrivers} 
      latestEvents={latestEvents} 
      topDrivers={leaderboardData.drivers} 
      virtualDuels={virtualDuels}
      globalStats={globalStats} // <-- Przekazanie na frontend
    />
  );
}