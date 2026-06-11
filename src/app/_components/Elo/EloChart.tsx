"use client";
import React, { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import ComboBadge from "@/app/_components/Elo/ComboBadge";

const DRIVER_COLORS = [
  "#eab308", // Yellow
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#a855f7", // Purple
];

interface RaceDataPoint {
  eventId: string;
  eventName: string;
  eventDate: string;
  hasRaced: boolean;
  id: string | null;
  elo: number;
  eloChange: number;
  combo: number;
}

interface DriverGroup {
  guid: string;
  name: string;
  data: RaceDataPoint[];
}

interface EloChartProps {
  guids: string[];
}

export default function EloChart({ guids }: EloChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [driversMeta, setDriversMeta] = useState<{ guid: string; name: string; color: string }[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | undefined>(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const isMounted = useRef(false);
  const isResettingScroll = useRef(false); 
  const isLoadingRef = useRef(false); // NOWOŚĆ: Niezależny od cyklu renderowania bloker zapytań
  
  const guidsString = guids.join(",");

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setChartData([]);
    setPage(0);
    setHasMore(true);
    isFirstLoad.current = true;
  }, [guidsString]);

  useEffect(() => {
    let isCurrent = true; 

    async function fetchEloData() {
      // Używamy useRef zamiast stanu 'loading', aby uniknąć pułapki Strict Mode
      if (!hasMore || isLoadingRef.current || guids.length === 0) return;
      
      isLoadingRef.current = true;
      setLoading(true);

      try {
        const res = await fetch(`/api/elo?guids=${guidsString}&page=${page}&limit=50`);
        const result = await res.json();

        if (!isCurrent) return; 

        if (result.success) {
          const incomingDrivers: DriverGroup[] = result.data;

          const meta = incomingDrivers.map((d, index) => ({
            guid: d.guid,
            name: d.name,
            color: DRIVER_COLORS[index % DRIVER_COLORS.length],
          }));
          setDriversMeta(meta);

          const sampleDriver = incomingDrivers[0];
          if (!sampleDriver) return;

          const pagePointsCount = sampleDriver.data.length;
          const localPageData: any[] = [];

          for (let i = 0; i < pagePointsCount; i++) {
            const point: any = {
              eventId: sampleDriver.data[i].eventId,
              eventDate: sampleDriver.data[i].eventDate,
              eventName: sampleDriver.data[i].eventName,
            };

            incomingDrivers.forEach((driver, idx) => {
              const driverRace = driver.data[i];
              if (!driverRace) return;

              const color = DRIVER_COLORS[idx % DRIVER_COLORS.length];

              point[`elo_${driver.guid}`] = driverRace.elo;
              point[`meta_${driver.guid}`] = {
                hasRaced: driverRace.hasRaced,
                eloChange: driverRace.eloChange,
                combo: driverRace.combo,
                driverName: driver.name,
                color: color
              };
            });

            localPageData.push(point);
          }

          const container = scrollContainerRef.current;
          const previousScrollWidth = container ? container.scrollWidth : 0;
          const previousScrollLeft = container ? container.scrollLeft : 0;

          setChartData((prev) => [...prev, ...localPageData]);
          setHasMore(result.hasMore);

          // Zamieniono requestAnimationFrame na setTimeout. Dajemy Reactowi chwilę 
          // na zrenderowanie nowych elementów DOM i poszerzenie kontenera
          setTimeout(() => {
            if (!isCurrent) return;
            const el = scrollContainerRef.current;
            if (!el) return;

            if (isFirstLoad.current) {
              isFirstLoad.current = false;
              isResettingScroll.current = true; 

              el.scrollLeft = el.scrollWidth;
              setTimeout(() => {
                isResettingScroll.current = false;
              }, 150);
            } else {
              const deltaWidth = el.scrollWidth - previousScrollWidth;
              el.scrollLeft = previousScrollLeft + deltaWidth;
            }
          }, 50); 
        }
      } catch (err) {
        console.error("Error fetching ELO data:", err);
      } finally {
        if (isCurrent) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    }
    
    fetchEloData();

    return () => {
      isCurrent = false; 
      isLoadingRef.current = false;
    };
  }, [page, guidsString]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    
    // Używamy isLoadingRef.current zamiast loading
    if (!container || isLoadingRef.current || !hasMore || isResettingScroll.current) return;
    if (container.scrollWidth <= container.clientWidth) return;

    if (container.scrollLeft <= 50) {
      isLoadingRef.current = true; // Blokujemy zanim asynchroniczny stan zdąży zadziałać
      setPage((prev) => prev + 1);
    }
  };

  const chronologicalData = [...chartData].reverse().map((point) => ({
    ...point,
    displayDate: new Date(point.eventDate).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  const calculatedWidth = Math.max(800, chronologicalData.length * 65);

  const allEloValues = chartData.flatMap(point =>
    guids.map(guid => point[`elo_${guid}`]).filter(val => val !== undefined)
  );
  const yMin = allEloValues.length ? Math.min(...allEloValues) - 40 : 900;
  const yMax = allEloValues.length ? Math.max(...allEloValues) + 40 : 1200;

  return (
    <div className="bg-brand-navy-dark border border-brand-navy-light rounded-brand-card p-6 shadow-xl relative overflow-hidden">

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-brand-muted">
            {guids.length > 1 ? "ELO Comparison Graph" : "ELO Performance Graph"}
          </h2>
          <p className="text-xs text-brand-muted/50 font-mono">← Scroll left to load older competitive history</p>
        </div>

        {driversMeta.length > 1 && (
          <div className="flex flex-wrap gap-3 bg-brand-navy/20 p-2 rounded border border-brand-navy-light/20">
            {driversMeta.map((m) => (
              <div key={m.guid} className="flex items-center gap-2 font-mono text-xs text-slate-200">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="font-bold">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        {loading && <LoadingSpinner text="Syncing timeline..." />}
      </div>

      <div className="relative flex border border-brand-navy-light/40 bg-brand-navy/30 rounded-lg p-4 overflow-hidden">

        <div className="w-16 h-[340px] flex-shrink-0 bg-brand-navy-dark/90 z-10 select-none border-r border-brand-navy-light/20">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chronologicalData} margin={{ top: 15, right: 0, left: 5, bottom: 25 }}>
              <XAxis dataKey="eventId" hide />
              <YAxis
                domain={[yMin, yMax]}
                width={45}
                stroke="#475569"
                opacity={0.8}
                tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#94a3b8' }}
              />
              {guids.map((guid) => (
                <Line key={guid} type="monotone" dataKey={`elo_${guid}`} stroke="transparent" dot={false} activeDot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          <div style={{ width: `${calculatedWidth}px`, height: "340px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={chronologicalData}
                margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                onMouseMove={(e) => {
                  if (e && e.activeCoordinate) {
                    const { x, y } = e.activeCoordinate;
                    if (!scrollContainerRef.current) return;

                    const container = scrollContainerRef.current;
                    const scrollLeft = container.scrollLeft;
                    const visibleWidth = container.clientWidth;

                    const tooltipWidth = 240;
                    const tooltipHeight = 60 + (guids.length * 38);
                    const chartHeight = 340;

                    let targetX = x + 20;
                    if (targetX + tooltipWidth > scrollLeft + visibleWidth) {
                      targetX = x - tooltipWidth - 20;
                    }
                    if (targetX < scrollLeft + 5) {
                      targetX = scrollLeft + 5;
                    }

                    let targetY = y - 40;
                    if (targetY + tooltipHeight > chartHeight - 10) {
                      targetY = y - tooltipHeight - 10;
                    }
                    if (targetY < 10) {
                      targetY = y + 20;
                    }
                    targetY = Math.max(10, Math.min(targetY, chartHeight - tooltipHeight - 10));

                    setTooltipPos({ x: targetX, y: targetY });
                  }
                }}
                onMouseLeave={() => setTooltipPos(undefined)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-navy-light)" opacity={0.2} />

                <XAxis
                  dataKey="eventId"
                  stroke="#475569"
                  opacity={0.6}
                  tickFormatter={(value) => {
                    const found = chronologicalData.find(p => p.eventId === value);
                    return found ? found.displayDate : '';
                  }}
                  tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                  dy={10}
                />

                <YAxis domain={[yMin, yMax]} hide />

                <Tooltip
                  content={<CustomCompareTooltip guids={guids} />}
                  cursor={{ stroke: 'var(--color-brand-navy-light)', strokeWidth: 1 }}
                  position={tooltipPos}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                />

                {guids.map((guid, index) => (
                  <Line
                    key={guid}
                    type="monotone"
                    dataKey={`elo_${guid}`}
                    stroke={DRIVER_COLORS[index % DRIVER_COLORS.length]}
                    strokeWidth={2.5}
                    connectNulls={true}
                    dot={<CustomDot guid={guid} color={DRIVER_COLORS[index % DRIVER_COLORS.length]} />}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload, guid, color } = props;
  const meta = payload[`meta_${guid}`];

  if (!meta || !meta.hasRaced) return null;

  return (
    <circle cx={cx} cy={cy} r={3.5} fill="var(--color-brand-navy-dark)" stroke={color} strokeWidth={2} />
  );
}

function CustomCompareTooltip({ active, payload, guids }: any) {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;

    return (
      <div className="bg-brand-navy-dark border border-brand-navy-light p-3 rounded-lg shadow-2xl font-mono text-xs min-w-[220px] z-[100]">
        <p className="text-brand-muted/70 mb-2 font-bold border-b border-b-brand-navy-light/40 pb-1 text-center truncate max-w-[240px]">
          {rawData.eventName}
        </p>

        <div className="flex flex-col gap-2">
          {guids.map((guid: string) => {
            const elo = rawData[`elo_${guid}`];
            const meta = rawData[`meta_${guid}`];

            if (elo === undefined || !meta) return null;

            const isGain = meta.eloChange >= 0;

            return (
              <div key={guid} className="flex flex-col border-l-2 pl-2" style={{ borderColor: meta.color }}>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-200 font-bold truncate max-w-[115px]">{meta.driverName}</span>
                    {meta.combo > 1 && <ComboBadge combo={meta.combo} />}
                  </div>
                  <span className="text-slate-100 font-black text-right whitespace-nowrap">{elo} ELO</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`${meta.hasRaced ? 'text-brand-muted/50' : 'text-amber-500/60 font-semibold'}`}>
                    {meta.hasRaced ? "🔴 Participated" : "⚪ Skipped (Static)"}
                  </span>
                  {meta.hasRaced && (
                    <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {isGain ? `+${meta.eloChange}` : meta.eloChange}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}