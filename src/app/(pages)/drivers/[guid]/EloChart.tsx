"use client";
import React, { useState, useEffect, useRef } from "react";
import { CircularProgress } from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface EloHistoryPoint {
  id: number;
  elo: number;
  eloChange: number;
  createdAt: string;
}

interface EloChartProps {
  guid: string;
}

export default function EloChart({ guid }: EloChartProps) {
  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Pobieranie historii ELO (Strona po stronie)
  useEffect(() => {
    async function fetchEloHistory() {
      if (!hasMore || loading) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/drivers/${guid}/elo?page=${page}&limit=50`);
        const data = await res.json();

        if (data.success) {
          const container = scrollContainerRef.current;
          const previousScrollWidth = container ? container.scrollWidth : 0;

          setEloHistory((prev) => [...prev, ...data.data]);
          setHasMore(data.hasMore);

          // Zachowanie pozycji przewijania przy doładowywaniu danych w lewo
          if (container && !isFirstLoad.current) {
            requestAnimationFrame(() => {
              const deltaWidth = container.scrollWidth - previousScrollWidth;
              container.scrollLeft += deltaWidth;
            });
          }

          // Przy pierwszym załadowaniu wyrównaj scroll do prawej krawędzi (najnowsze dane)
          if (isFirstLoad.current) {
            isFirstLoad.current = false;
            requestAnimationFrame(() => {
              if (container) container.scrollLeft = container.scrollWidth;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching ELO history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEloHistory();
  }, [page, guid]);

  // Detekcja osiągnięcia lewej krawędzi wykresu
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    if (container.scrollLeft <= 50) {
      setPage((prev) => prev + 1);
    }
  };

  // Przygotowanie danych (odwrócenie do poprawnej chronologii)
  const chronologicalData = [...eloHistory].reverse().map((point) => ({
    ...point,
    displayDate: new Date(point.createdAt).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  const calculatedWidth = Math.max(800, chronologicalData.length * 55);

  return (
    <div className="bg-brand-navy-dark border border-brand-navy-light rounded-brand-card p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-brand-muted">ELO Performance Graph</h2>
          <p className="text-xs text-brand-muted/50 font-mono">← Scroll left to load older competitive history</p>
        </div>
        
        {/* Osobny spinner tylko dla wykresu */}
        {loading && <LoadingSpinner text="Syncing backlog..." />}
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto overflow-y-hidden scroll-smooth border border-brand-navy-light/40 bg-brand-navy/30 rounded-lg p-4"
        style={{ contentVisibility: "auto" }}
      >
        <div style={{ width: `${calculatedWidth}px`, height: "340px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chronologicalData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-navy-light)" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                stroke="var(--color-brand-muted)" 
                opacity={0.6}
                tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis domain={['dataMin - 30', 'dataMax + 30']} stroke="var(--color-brand-muted)" opacity={0.6} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-brand-navy-light)', strokeWidth: 1 }} />
              <Line 
                type="monotone" 
                dataKey="elo" 
                stroke="var(--color-brand-yellow)" 
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-brand-navy-dark)', stroke: 'var(--color-brand-yellow)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--color-brand-yellow)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as EloHistoryPoint;
    const isGain = data.eloChange >= 0;

    return (
      <div className="bg-brand-navy-dark border border-brand-navy-light p-3 rounded-lg shadow-2xl font-mono text-xs">
        <p className="text-brand-muted/50 mb-1.5 font-bold">
          {new Date(data.createdAt).toLocaleDateString("en-US", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
          })}
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-brand-muted font-bold text-sm">
            Rating: <span className="text-slate-100 font-black">{data.elo}</span>
          </p>
          <p className={`font-bold ${isGain ? 'text-elo-gain' : 'text-elo-loss'}`}>
            Shift: {isGain ? `+${data.eloChange}` : data.eloChange} Pts
          </p>
        </div>
      </div>
    );
  }
  return null;
}