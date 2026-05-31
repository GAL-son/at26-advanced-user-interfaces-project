"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Container,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
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
        console.error("Błąd ładowania danych wyścigu:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress aria-label="Ładowanie wyników wyścigu" />
      </Box>
    );
  }

  if (!raceInfo || results.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Nie znaleziono szczegółów tego wyścigu.
        </Typography>
        <Button
          component={Link}
          href="/events"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Powrót do listy
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} component="main">
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        href="/events"
        sx={{ mb: 4 }}
      >
        Powrót do listy
      </Button>
      <RaceInfo info={raceInfo} />
      <ResultList results={results} />
    </Container>
  );
}
