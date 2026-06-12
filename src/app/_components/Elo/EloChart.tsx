"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EventDot from "@/app/_components/Elo/EventDot";
import EventTooltip from "@/app/_components/Elo/EventTooltip";
import { Box } from "@mui/material";

// Uaktualniona paleta kolorów linii: zbalansowana pod kątem jasnego i ciemnego tła
const DRIVER_COLORS = [
  "var(--color-brand-yellow-hover)", // Głęboki złoty/żółty
  "#2563eb", // Stabilny niebieski (Blue 600)
  "#dc2626", // Stabilny czerwony (Red 600)
  "#059669", // Stabilny szmaragdowy (Emerald 600)
  "#7c3aed", // Stabilny fioletowy (Purple 600)
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
  const [driversMeta, setDriversMeta] = useState<
    { guid: string; name: string; color: string }[]
  >([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const isMounted = useRef(false);
  const isResettingScroll = useRef(false);
  const isLoadingRef = useRef(false);

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
      if (!hasMore || isLoadingRef.current || guids.length === 0) return;

      isLoadingRef.current = true;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/elo?guids=${guidsString}&page=${page}&limit=50`,
        );
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
                color: color,
              };
            });

            localPageData.push(point);
          }

          const container = scrollContainerRef.current;
          const previousScrollWidth = container ? container.scrollWidth : 0;
          const previousScrollLeft = container ? container.scrollLeft : 0;

          setChartData((prev) => [...prev, ...localPageData]);
          setHasMore(result.hasMore);

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

    if (
      !container ||
      isLoadingRef.current ||
      !hasMore ||
      isResettingScroll.current
    )
      return;
    if (container.scrollWidth <= container.clientWidth) return;

    if (container.scrollLeft <= 50) {
      isLoadingRef.current = true;
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

  const allEloValues = chartData.flatMap((point) =>
    guids
      .map((guid) => point[`elo_${guid}`])
      .filter((val) => val !== undefined),
  );
  const yMin = allEloValues.length ? Math.min(...allEloValues) - 40 : 900;
  const yMax = allEloValues.length ? Math.max(...allEloValues) + 40 : 1200;

  return (
    <Box
      className="p-6 shadow-xl relative overflow-hidden"
      sx={{
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
      }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color: "var(--color-brand-text)" }} // Poprawiono kontrast tytułu
          >
            {guids.length > 1
              ? "ELO Comparison Graph"
              : "ELO Performance Graph"}
          </h2>
          <p
            className="text-xs font-mono"
            style={{ color: "var(--color-brand-text-muted)", opacity: 0.7 }}
          >
            ← Scroll left to load older competitive history
          </p>
        </div>

        {/* LEGENDA KIEROWCÓW */}
        {driversMeta.length > 1 && (
          <Box
            className="flex flex-wrap gap-3 p-2 rounded"
            sx={{
              backgroundColor: "var(--color-brand-navy)",
              border: "1px solid var(--color-brand-navy-light)",
            }}
          >
            {driversMeta.map((m) => (
              <div
                key={m.guid}
                className="flex items-center gap-2 font-mono text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span
                  className="font-bold"
                  style={{ color: "var(--color-brand-text)" }}
                >
                  {m.name}
                </span>
              </div>
            ))}
          </Box>
        )}

        {loading && <LoadingSpinner text="Syncing timeline..." />}
      </div>

      {/* GLÓWNY KONTENER WYKRESU */}
      <Box
        className="relative flex rounded-lg p-4 overflow-hidden"
        sx={{
          backgroundColor: "var(--color-brand-navy)",
          border: "1px solid var(--color-brand-navy-light)",
        }}
      >
        {/* LEWA, PRZYPIĘTA OŚ Y */}
        <Box
          className="w-16 h-[340px] flex-shrink-0 z-10 select-none"
          sx={{
            backgroundColor: "var(--color-brand-navy-dark)",
            borderRight: "1px solid var(--color-brand-navy-light)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={chronologicalData}
              margin={{ top: 15, right: 0, left: 5, bottom: 25 }}
            >
              <XAxis dataKey="eventId" hide />
              <YAxis
                domain={[yMin, yMax]}
                width={45}
                stroke="transparent" // Ukrywamy samą pionową kreskę osi, zostawiając jedynie czytelne cyfry ELO
                tick={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fill: "var(--color-brand-text-muted)",
                }}
              />
              {guids.map((guid) => (
                <Line
                  key={guid}
                  type="monotone"
                  dataKey={`elo_${guid}`}
                  stroke="transparent"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* SCROLLOWALNY TRZON WYKRESU */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden"
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
                    const tooltipHeight = 60 + guids.length * 38;
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
                    targetY = Math.max(
                      10,
                      Math.min(targetY, chartHeight - tooltipHeight - 10),
                    );

                    setTooltipPos({ x: targetX, y: targetY });
                  }
                }}
                onMouseLeave={() => setTooltipPos(undefined)}
              >
                {/* Dostosowanie linii siatki wykresu */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-brand-text-muted)"
                  opacity={0.15}
                />

                {/* Dolna oś czasu/dat wyścigów */}
                <XAxis
                  dataKey="eventId"
                  stroke="var(--color-brand-navy-light)"
                  tickFormatter={(value) => {
                    const found = chronologicalData.find(
                      (p) => p.eventId === value,
                    );
                    return found ? found.displayDate : "";
                  }}
                  tick={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "var(--color-brand-text-muted)",
                  }}
                  dy={10}
                />

                <YAxis domain={[yMin, yMax]} hide />

                <Tooltip
                  content={<EventTooltip guids={guids} />}
                  cursor={{
                    stroke: "var(--color-brand-navy-light)",
                    strokeWidth: 1,
                  }}
                  position={tooltipPos}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{ zIndex: 100, pointerEvents: "none" }}
                />

                {guids.map((guid, index) => (
                  <Line
                    key={guid}
                    type="monotone"
                    dataKey={`elo_${guid}`}
                    stroke={DRIVER_COLORS[index % DRIVER_COLORS.length]}
                    strokeWidth={2.5}
                    connectNulls={true}
                    dot={
                      <EventDot
                        guid={guid}
                        color={DRIVER_COLORS[index % DRIVER_COLORS.length]}
                      />
                    }
                    activeDot={{ r: 5, strokeWidth: 1 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Box>
    </Box>
  );
}
