import ActiveDriversTicker, { ActiveDriver } from "@/app/_components/Home/ActiveDriversTicker";

interface HomePageProps {
  activeDrivers: ActiveDriver[];
}

export default function HomePage({ activeDrivers }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Karuzela renderuje się tu, dostaje dane z serwera, ale w środku ma "use client" dla animacji */}
      <ActiveDriversTicker drivers={activeDrivers} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[var(--color-brand-text)]">
          Witaj w Lidze Simracingowej
        </h1>
        
        {/* Tutaj wejdą kolejne komponenty strony głównej */}
        {/* <OtherComponent /> */}
      </main>
    </div>
  );
}