"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import EventDot from "@/app/_components/Elo/EventDot";
import EventTooltip from "@/app/_components/Elo/EventTooltip";
import ScrollArrow from "@/app/_components/Common/ScrollArrow"; // Zakładam taką ścieżkę importu
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

interface EloChartProps extends React.HTMLAttributes<HTMLElement> {
  guids: string[];
  isComparable?: boolean;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function EloChart({
  guids,
  isComparable = false,
  onNavigateVertical,
  ...props
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
  const [isAtInitialRight, setIsAtInitialRight] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    setIsAtInitialRight(true); // ⬅️ DODAJ TO
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
              setIsInitialLoading(false); // <--- To wyłączy overlay po pierwszym razie
              setLoading(false);
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
    const dots = container.querySelectorAll(`.recharts-line-dot`);

    let targetX = 0;
    let targetY = 150;

    const pointsPerLine = chronologicalData.length;
    let foundDot: SVGCircleElement | null = null;

    for (let i = 0; i < guids.length; i++) {
      const dotIndex = (i * pointsPerLine) + index;
      const dotEl = dots[dotIndex] as SVGCircleElement;
      if (dotEl) {
        foundDot = dotEl;
        break;
      }
    }

    if (foundDot) {
      targetX = foundDot.cx.baseVal.value;
      targetY = foundDot.cy.baseVal.value;
    } else {
      const paddingLeft = 40;
      const paddingRight = 10;
      const availableWidth = calculatedWidth - paddingLeft - paddingRight;
      const stepsCount = chronologicalData.length - 1 || 1;
      targetX = paddingLeft + (index * (availableWidth / stepsCount));
    }

    const tooltipWidth = 280;
    const tooltipHeight = 60 + guids.length * 38;
    const chartHeight = 340;

    let calculatedX = targetX + 25;

    if (calculatedX + tooltipWidth > container.scrollLeft + container.clientWidth) {
      calculatedX = targetX - tooltipWidth - 25;
    }

    let calculatedY = targetY - (tooltipHeight / 2);
    calculatedY = Math.max(10, Math.min(calculatedY, chartHeight - tooltipHeight - 15));

    setTooltipPos({
      x: Math.max(container.scrollLeft + 5, calculatedX),
      y: calculatedY,
    });
  };

  const scrollActivePointIntoView = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    const dots = container.querySelectorAll(`.recharts-line-dot`);
    const dotEl = dots[index] as SVGCircleElement;

    let pointX = 0;
    if (dotEl) {
      pointX = dotEl.cx.baseVal.value;
    } else {
      const paddingLeft = 40;
      const paddingRight = 10;
      const availableWidth = calculatedWidth - paddingLeft - paddingRight;
      pointX = paddingLeft + (index * (availableWidth / (chronologicalData.length - 1 || 1)));
    }

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

    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && onNavigateVertical) {
      e.preventDefault();
      e.stopPropagation();
      setIsKeyboardActive(false);
      setTooltipPos(undefined);
      onNavigateVertical(e.key === "ArrowUp" ? "up" : "down");
      return;
    }

    if (focusedIndex === null) {
      const lastIdx = chronologicalData.length - 1;
      setFocusedIndex(lastIdx);
      setIsKeyboardActive(true);
      setTimeout(() => updateKeyboardTooltipPosition(lastIdx), 30);
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

    // 🟢 LOGIKA DLA STRZAŁKI W LEWO:
    // Obliczamy maksymalny możliwy scroll w prawo
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    // Jeśli użytkownik przewinął w lewo o więcej niż 20px od skrajnej prawej pozycji:
    if (maxScrollLeft - container.scrollLeft > 20) {
      setIsAtInitialRight(false);
    } else {
      setIsAtInitialRight(true);
    }

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
        if (chronologicalData.length > 0) {
          const lastIndex = chronologicalData.length - 1;
          setFocusedIndex(lastIndex);
          setIsKeyboardActive(true);
          setTimeout(() => {
            updateKeyboardTooltipPosition(lastIndex);
          }, 50);
        }
      }}
      onBlur={() => {
        setIsKeyboardActive(false);
        setTooltipPos(undefined);
        setFocusedIndex(null);
      }}
      {...props}
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
      </div>

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
        className="relative flex rounded-lg p-2 transition-all"
        sx={{
          backgroundColor: "var(--color-brand-navy)",
          border: "1px solid var(--color-brand-navy-light)",
        }}
      >
        {/* Overlay dla stanu ładowania */}
        <Box
          className={`absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-brand-navy)]/80 backdrop-blur-[2px] fade-in-out ${(loading || isInitialLoading) ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <LoadingSpinner text={t("chart.syncingTimeline")} />
        </Box>
        {scrollMasks.left && (
          <Box
            className="absolute top-0 bottom-0 z-30 pointer-events-none w-12"
            sx={{
              left: "48px",
              background: "linear-gradient(to right, var(--color-brand-navy), transparent)"
            }}
          />
        )}

        {scrollMasks.right && (
          <Box
            className="absolute top-0 bottom-0 right-0 z-30 pointer-events-none w-12"
            sx={{
              background: "linear-gradient(to left, var(--color-brand-navy), transparent)"
            }}
          />
        )}

        {/* REUŻYWALNY INSTANCE: STRZAŁKA W LEWO (z-10 ukrywa ją pod tooltipem) */}
        {scrollMasks.left && isAtInitialRight && (
          <ScrollArrow
            direction="left"
            className="absolute left-14 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none !p-0"
            style={{ mixBlendMode: 'screen' }}
          />
        )}

        {/* LEWA OŚ Y (z-20 przysłania strzałkę w lewo przy pełnym scrollu) */}
        <Box
          className="w-12 h-[340px] flex-shrink-0 select-none relative z-20"
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

        {/* TRZON WYKRESU (z-20 sprawia, że pływający tooltip przykrywa strzałki z-10) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden relative z-20"
        >
          <div style={{ width: `${calculatedWidth}px`, height: "340px" }} className="relative">

            {/* Tooltip HTML z z-index 9999 rysowany wewnątrz nadrzędnego z-20 – w pełni bezpieczny przed przebiciem */}
            {focusedIndex !== null && tooltipPos && (
              <div
                style={{
                  position: "absolute",
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  zIndex: 9999,
                  pointerEvents: "none",
                  transition: "left 0.08s ease-out, top 0.08s ease-out"
                }}
              >
                <EventTooltip
                  guids={guids}
                  keyboardRawData={chronologicalData[focusedIndex]}
                />
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={chronologicalData}
                margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
                onMouseMove={(e) => {
                  if (e && e.activeCoordinate) {
                    setIsKeyboardActive(false);
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

                    if (e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
                      setFocusedIndex(e.activeTooltipIndex);
                      setTooltipPos({ x: targetX, y: targetY });
                    }
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
                        keyboardFocusedIndex={focusedIndex}
                      />
                    }
                    activeDot={false}
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