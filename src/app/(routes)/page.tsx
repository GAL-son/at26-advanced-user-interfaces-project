import HomePage from "@/app/_pages/HomePage";
import { getRecentlyActiveDrivers } from "@/lib/services/drivers";

// Serwer wymusza rewalidację całej strony np. co 5 minut (opcjonalnie)
export const revalidate = 300; 

export default async function Page() {
  // Wywołanie bezpośrednio metody serwisu
  const activeDrivers = await getRecentlyActiveDrivers({ sinceParam: '14d', limitParam: 15 }); 

  return <HomePage activeDrivers={activeDrivers} />;
}