"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Button, Typography, Box, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import RaceInfo from "./RaceInfo";
import ResultList from "./ResultList";

export interface RaceResultExtended {
  pos: number;
  name: string;
  car: string;
  laps: number;
  totalTime: number;
  bestLap: number;
  gap: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  combo: number;
}

export default function EventResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [raceInfo, setRaceInfo] = useState<any>(null);
  const [results, setResults] = useState<RaceResultExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/event/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setLoading(false);
          return;
        }

        setRaceInfo(data.info);
        const leaderTime = data.results[0]?.totalTime || 0;

        const mappedResults: RaceResultExtended[] = data.results.map(
          (res: any, index: number) => {
            const gap =
              index === 0
                ? "-"
                : `+${((res.totalTime - leaderTime) / 1000).toFixed(3)}s`;

            return {
              pos: index + 1,
              name: res.driverName,
              car: res.carModel.replace(/_/g, " "),
              laps: res.numLaps,
              totalTime: res.totalTime,
              bestLap: res.bestLap,
              gap: gap,
              eloBefore: res.eloBefore,
              eloAfter: res.eloAfter,
              eloChange: res.eloChange,
              combo: res.combo,
            };
          },
        );

        setResults(mappedResults);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading race data:", err);
        setLoading(false);
      });
  }, [id]);

  // STAN ŁADOWANIA (Loader dopasowany do kolorystyki)
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen bg-brand-navy">
        <CircularProgress 
          aria-label="Loading race results" 
          sx={{ color: '#fff200' }} // Nasz jaskrawy żółty akcent
        />
      </Box>
    );
  }

  // STAN BŁĘDU / BRAKU DANYCH
  if (!raceInfo || results.length === 0) {
    return (
      <Box className="min-h-screen bg-brand-navy text-slate-100 flex items-center justify-center p-4">
        <Container maxWidth="md" className="bg-brand-navy-dark border border-brand-navy-light/40 rounded-xl p-8 text-center shadow-xl">
          <Typography variant="h6" className="!text-rose-400 !font-bold mb-4">
            Race details could not be found.
          </Typography>
          <Button
            component={Link}
            href="/events"
            startIcon={<ArrowBackIcon />}
            className="!bg-brand-navy-light !text-slate-200 hover:!text-brand-yellow border border-brand-navy-light/60 transition-colors"
          >
            Back to events
          </Button>
        </Container>
      </Box>
    );
  }

  // WŁAŚCIWY LAYOUT STRONY
  return (
    <Box className="min-h-screen bg-brand-navy text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="lg" component="main" className="p-0!">
        
        {/* Przycisk powrotu w stylu HUD */}
        <Box className="mb-6">
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/events"
            className="!text-slate-400 hover:!text-brand-yellow !font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Back to events
          </Button>
        </Box>

        {/* Sekcja informacji o wyścigu */}
        <RaceInfo info={raceInfo} />

        {/* Tabela z wynikami */}
        <ResultList results={results} />

      </Container>
    </Box>
  );
}