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
import { Box, useTheme, useMediaQuery, Button } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";

const DRIVER_COLORS = [
  "var(--color-brand-yellow-hover)",
  "#2563eb",
  "#dc2626",
  "#059669",
  "#7c3aed",
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

// Rozszerzamy o standardowe atrybuty sekcji HTML (w tym data-* props)
interface EloChartProps extends React.HTMLAttributes<HTMLElement> {
  guids: string[];
  isComparable?: boolean;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function EloChart({
  guids,
  isComparable = false,
  onNavigateVertical,
  ...props // Zbieramy resztę propsów, w tym kluczowe data-focus-order
}: EloChartProps) {
  const router = useRouter();
  const t = useTranslations("Elo");
  const format = useFormatter();

  const [chartData, setChartData] = useState<any[]>([]);
  const [driversMeta, setDriversMeta] = useState<{ guid: string; name: string; color: string }[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | undefined>(undefined);
  const [scrollMasks, setScrollMasks] = useState({ left: false, right: false });

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const isMounted = useRef(false);
  const isResettingScroll = useRef(false);
  const isLoadingRef = useRef(false);

  const guidsString = guids.join(",");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const updateScrollMasks = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setScrollMasks({
      left: scrollLeft > 5,
      right: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5,
    });
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setChartData([]);
    setPage(0);
    setHasMore(true);
    isFirstLoad.current = true;
    setFocusedIndex(null);
    setIsKeyboardActive(false);
  }, [guidsString]);

  const chronologicalData = [...chartData].reverse().map((point) => ({
    ...point,
    displayDate: format.dateTime(new Date(point.eventDate), {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  const POINT_WIDTH = 65;
  const calculatedWidth = Math.max(800, chronologicalData.length * POINT_WIDTH);

  useEffect(() => {
    let isCurrent = true;

    async function fetchEloData() {
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
                color: color,
              };
            });

            localPageData.push(point);
          }

          const container = scrollContainerRef.current;
          const previousScrollWidth = container ? container.scrollWidth : 0;
          const previousScrollLeft = container ? container.scrollLeft : 0;

          setChartData((prev) => {
            const newData = [...prev, ...localPageData];
            if (isFirstLoad.current) {
              setFocusedIndex(newData.length - 1);
            }
            return newData;
          });
          setHasMore(result.hasMore);

          setTimeout(() => {
            if (!isCurrent) return;
            const el = scrollContainerRef.current;
            if (!el) return;

            if (isFirstLoad.current) {
              isFirstLoad.current = false;
              isResettingScroll.current = true;

              el.scrollLeft = el.scrollWidth;
              updateScrollMasks();
              setTimeout(() => {
                isResettingScroll.current = false;
              }, 150);
            } else {
              const deltaWidth = el.scrollWidth - previousScrollWidth;
              el.scrollLeft = previousScrollLeft + deltaWidth;
              updateScrollMasks();
            }
          }, 50);
        }
      } catch (err) {
        console.error("Error searching ELO data:", err);
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

  const updateKeyboardTooltipPosition = (index: number) => {
    if (!scrollContainerRef.current || chronologicalData.length === 0) return;

    const container = scrollContainerRef.current;
    const paddingLeft = 40; // Margines lewej osi
    const chartHeight = 340;
    const paddingTop = 15;
    const paddingBottom = 40; // Miejsce na oś X na dole

    // 1. Wyliczenie pozycji X
    const targetX = paddingLeft + (index * ((calculatedWidth - paddingLeft - 10) / (chronologicalData.length - 1 || 1)));

    // 2. Wyliczenie ŚREDNIEJ pozycji Y ze wszystkich dostępnych serii danych (kierowców)
    const point = chronologicalData[index];

    // Zbieramy wartości ELO tylko od tych kierowców, którzy mają dane w tym konkretnym punkcie
    const availableElos = guids
      .map(g => point[`elo_${g}`])
      .filter((elo): elo is number => elo !== undefined);

    // Jeśli z jakiegoś powodu brak danych, dajemy środek osi, w przeciwnym wypadku liczymy średnią arytmetyczną
    const averageElo = availableElos.length > 0
      ? availableElos.reduce((sum, val) => sum + val, 0) / availableElos.length
      : (yMin + yMax) / 2;

    // Proporcjonalne zmapowanie uśrednionej wartości ELO na piksele wykresu (odwrócona oś Y w SVG)
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const eloPercentage = (averageElo - yMin) / (yMax - yMin || 1);
    const dotY = chartHeight - paddingBottom - (eloPercentage * usableHeight);

    // Wymiary tooltipa do korekcji marginesów
    const tooltipWidth = 240;
    const tooltipHeight = 60 + guids.length * 38;

    // KOREKCJA X (zwiększamy margines, gdy tooltip ląduje po lewej stronie kropki)
    let calculatedX = targetX + 25; // Domyślnie po prawej stronie kropki (+25px)

    if (calculatedX + tooltipWidth > container.scrollLeft + container.clientWidth) {
      // Jeśli nie mieści się po prawej, przerzucamy na lewą stronę kropki.
      // Zmieniamy z -25 na -40 (lub więcej), aby całkowicie odsłonić powiększoną kropkę oraz jej obwódkę.
      calculatedX = targetX - tooltipWidth - 45;
    }

    // Korekcja Y (centrowanie tooltipa względem wyliczonego środka ciężkości)
    let calculatedY = dotY - (tooltipHeight / 2);
    calculatedY = Math.max(10, Math.min(calculatedY, chartHeight - tooltipHeight - 15));

    setTooltipPos({
      x: Math.max(container.scrollLeft + 5, calculatedX),
      y: calculatedY,
    });
  };

  const scrollActivePointIntoView = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const paddingLeft = 40;

    const pointX = paddingLeft + (index * ((calculatedWidth - paddingLeft - 10) / (chronologicalData.length - 1 || 1)));

    const minVisible = container.scrollLeft + 80;
    const maxVisible = container.scrollLeft + container.clientWidth - 80;

    if (pointX < minVisible || pointX > maxVisible) {
      container.scrollTo({
        left: pointX - container.clientWidth / 2,
        behavior: "smooth"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (chronologicalData.length === 0) return;

    // Strzałki pionowe -> wyjście z sekcji wykresu
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && onNavigateVertical) {
      e.preventDefault();
      e.stopPropagation(); // Zatrzymujemy bąbelkowanie, by rodzic nie dublował akcji
      setIsKeyboardActive(false);
      setTooltipPos(undefined);
      onNavigateVertical(e.key === "ArrowUp" ? "up" : "down");
      return; // Natychmiast przerywamy dalsze sprawdzanie
    }

    if (focusedIndex === null) {
      setFocusedIndex(chronologicalData.length - 1);
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIsKeyboardActive(true);
      const nextIndex = Math.max(0, focusedIndex - 1);

      if (nextIndex <= 2 && !isLoadingRef.current && hasMore) {
        isLoadingRef.current = true;
        setPage((prev) => prev + 1);
      }

      setFocusedIndex(nextIndex);
      updateKeyboardTooltipPosition(nextIndex);
      scrollActivePointIntoView(nextIndex);
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIsKeyboardActive(true);
      const nextIndex = Math.min(chronologicalData.length - 1, focusedIndex + 1);
      setFocusedIndex(nextIndex);
      updateKeyboardTooltipPosition(nextIndex);
      scrollActivePointIntoView(nextIndex);
    }
  };

  const handleScroll = () => {
    updateScrollMasks();

    const container = scrollContainerRef.current;
    if (!container || isLoadingRef.current || !hasMore || isResettingScroll.current) return;
    if (container.scrollWidth <= container.clientWidth) return;

    if (container.scrollLeft <= 50) {
      isLoadingRef.current = true;
      setPage((prev) => prev + 1);
    }
  };

  const allEloValues = chartData.flatMap((point) =>
    guids.map((guid) => point[`elo_${guid}`]).filter((val) => val !== undefined)
  );
  const yMin = allEloValues.length ? Math.min(...allEloValues) - 40 : 900;
  const yMax = allEloValues.length ? Math.max(...allEloValues) + 40 : 1200;

  const handleCompareClick = () => {
    router.push(`/drivers/compare?guids=${guidsString}`);
  };

  return (
    <Box
      component="section"
      aria-labelledby="chart-title"
      className="p-6 shadow-xl relative overflow-hidden focus-brand"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (focusedIndex === null && chronologicalData.length > 0) {
          const lastIndex = chronologicalData.length - 1;
          setFocusedIndex(lastIndex);
          setIsKeyboardActive(true);
          setTimeout(() => updateKeyboardTooltipPosition(lastIndex), 50);
        }
      }}
      onBlur={() => {
        setIsKeyboardActive(false);
        setTooltipPos(undefined);
      }}
      {...props} // KLUCZOWA ZMIANA: Przekazujemy "data-focus-order" na kontener sekcji wykresu
      sx={{
        backgroundColor: "var(--color-brand-navy-dark)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
        "&:focus": { outline: "none" }
      }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 id="chart-title" className="text-lg font-bold uppercase tracking-wider text-[var(--color-brand-text)]">
            {guids.length > 1 ? t("chart.comparisonTitle") : t("chart.performanceTitle")}
          </h2>
          <p className="text-xs font-mono text-[var(--color-brand-text-muted)] opacity-70">
            {t("chart.scrollInstruction")}
          </p>
        </div>

        {/* LEGENDA */}
        <div className="flex flex-wrap items-center gap-3">
          {driversMeta.length > 0 && (
            <Box
              role="legend"
              aria-label={t("chart.legendAria")}
              className="flex flex-wrap gap-3 p-2 rounded"
              sx={{
                backgroundColor: "var(--color-brand-navy)",
                border: "1px solid var(--color-brand-navy-light)",
              }}
            >
              {driversMeta.map((m) => (
                <div key={m.guid} className="flex items-center gap-2 font-mono text-xs">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" aria-hidden="true" style={{ backgroundColor: m.color }} />
                  <span className="font-bold text-[var(--color-brand-text)]">{m.name}</span>
                </div>
              ))}
            </Box>
          )}

          {/* PRZYCISK PORÓWNANIA */}
          {isComparable && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CompareArrowsIcon />}
              onClick={handleCompareClick}
              tabIndex={-1}
              sx={{
                borderColor: "var(--color-brand-navy-light)",
                color: "var(--color-brand-text)",
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                backgroundColor: "var(--color-brand-navy)",
                "&:hover": {
                  borderColor: "var(--color-brand-yellow-hover)",
                  backgroundColor: "color-mix(in srgb, var(--color-brand-yellow-hover) 8%, transparent)",
                },
              }}
            >
              {t("chart.compareButton")}
            </Button>
          )}
        </div>

        {loading && <LoadingSpinner text={t("chart.syncingTimeline")} />}
      </div>

      {/* WCAG Fallback Table */}
      <div className="sr-only">
        <h3>{t("chart.tableFallbackTitle")}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("chart.tableEvent")}</th>
              {driversMeta.map(m => <th key={m.guid}>{m.name} ELO</th>)}
            </tr>
          </thead>
          <tbody>
            {chronologicalData.map((point) => (
              <tr key={point.eventId}>
                <td>{point.eventName} ({point.displayDate})</td>
                {driversMeta.map(m => (
                  <td key={m.guid}>
                    {point[`elo_${m.guid}`] !== undefined
                      ? format.number(Math.round(point[`elo_${m.guid}`]))
                      : t("chart.noDataFallback")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GRAPHX WRAPPER */}
      <Box
        ref={chartWrapperRef}
        role="img"
        aria-labelledby="chart-title"
        className="relative flex rounded-lg p-2 overflow-hidden"
        sx={{
          backgroundColor: "var(--color-brand-navy)",
          border: "1px solid var(--color-brand-navy-light)",
        }}
      >
        {scrollMasks.left && (
          <Box
            className="absolute top-0 bottom-0 z-20 pointer-events-none w-12"
            sx={{
              left: "48px",
              background: "linear-gradient(to right, var(--color-brand-navy), transparent)"
            }}
          />
        )}

        {scrollMasks.right && (
          <Box
            className="absolute top-0 bottom-0 right-0 z-20 pointer-events-none w-12"
            sx={{
              background: "linear-gradient(to left, var(--color-brand-navy), transparent)"
            }}
          />
        )}

        {/* STATYCZNA LEWA OŚ Y */}
        <Box
          className="w-12 h-[340px] flex-shrink-0 z-30 select-none"
          aria-hidden="true"
          sx={{
            backgroundColor: "var(--color-brand-navy)",
            borderRight: "1px solid var(--color-brand-navy-light)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chronologicalData} margin={{ top: 15, right: 0, left: 0, bottom: 25 }}>
              <XAxis dataKey="eventId" hide />
              <YAxis
                type="number"
                domain={[yMin, yMax]}
                width={40}
                stroke="transparent"
                tick={{ fontFamily: "monospace", fontSize: 10, fill: "var(--color-brand-text-muted)" }}
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

        {/* TRZON WYKRESU */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden z-10"
        >
          <div style={{ width: `${calculatedWidth}px`, height: "340px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={chronologicalData}
                margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
                onMouseMove={(e) => {
                  if (isKeyboardActive) return;

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
                    targetY = Math.max(10, Math.min(targetY, chartHeight - tooltipHeight - 10));

                    if (e.activeTooltipIndex !== undefined) {
                      setFocusedIndex(e.activeTooltipIndex);
                    }
                    setTooltipPos({ x: targetX, y: targetY });
                  }
                }}
                onMouseLeave={() => {
                  if (!isKeyboardActive) {
                    setTooltipPos(undefined);
                    setFocusedIndex(null);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-text-muted)" opacity={0.15} />

                <XAxis
                  dataKey="eventId"
                  stroke="var(--color-brand-navy-light)"
                  tickFormatter={(value) => {
                    const found = chronologicalData.find((p) => p.eventId === value);
                    return found ? found.displayDate : "";
                  }}
                  tick={{ fontFamily: "monospace", fontSize: 10, fontWeight: "bold", fill: "var(--color-brand-text-muted)" }}
                  dy={10}
                />

                <YAxis domain={[yMin, yMax]} hide />

                <Tooltip
                  // ZMIANA: Przekazujemy aktualny punkt bezpośrednio jako prop "keyboardRawData"
                  content={
                    <EventTooltip
                      guids={guids}
                      keyboardRawData={
                        isKeyboardActive && focusedIndex !== null
                          ? chronologicalData[focusedIndex]
                          : undefined
                      }
                    />
                  }
                  cursor={{ stroke: "var(--color-brand-navy-light)", strokeWidth: 1 }}
                  position={tooltipPos}
                  active={(focusedIndex !== null && tooltipPos !== undefined) || isKeyboardActive}
                  activeTooltipIndex={focusedIndex ?? undefined}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{
                    zIndex: 100,
                    pointerEvents: "none",
                    display: (isKeyboardActive || tooltipPos) ? "block" : "none",
                    opacity: (isKeyboardActive || tooltipPos) ? 1 : 0,
                    visibility: (isKeyboardActive || tooltipPos) ? "visible" : "hidden"
                  }}
                  style={{
                    display: "block",
                    opacity: 1
                  }}
                  payload={
                    isKeyboardActive && focusedIndex !== null && chronologicalData[focusedIndex]
                      ? [{ payload: chronologicalData[focusedIndex] }]
                      : undefined
                  }
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
                        isMobile={isMobile}
                        // Przekazujemy aktualny indeks z klawiatury, aby kropka wiedziała kiedy urosnąć
                        keyboardFocusedIndex={focusedIndex}
                      />
                    }
                    activeDot={{ r: isMobile ? 6.5 : 5, strokeWidth: 1 }}
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