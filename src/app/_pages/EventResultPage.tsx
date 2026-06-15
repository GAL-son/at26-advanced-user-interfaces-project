"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import RaceInfo from "@/app/_components/Results/RaceInfo";
import ResultList from "@/app/_components/Results/ResultList";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import BackButton from "@/app/_components/Common/BackButton";
import { useTranslations } from "next-intl";

export interface RaceResultExtended {
  guid: string;
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
  const t = useTranslations("Results");
  const params = useParams();
  const id = params?.id as string;

  const [raceInfo, setRaceInfo] = useState<any>(null);
  const [results, setResults] = useState<RaceResultExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.raceResults || data.raceResults.length === 0) {
          setLoading(false);
          return;
        }

        setRaceInfo({
          name: data.name,
          track: data.track,
          date: data.date,
          server: data.server,
          processed: data.processed,
        });

        const leaderResults = data.raceResults[0];
        const leaderTime = leaderResults?.totalTime || 0;
        const leaderLaps = leaderResults?.laps || 0;

        const mappedResults: RaceResultExtended[] = data.raceResults.map(
          (res: any, index: number) => {
            let gapString = "-";
            if (index > 0) {
              if (res.laps < leaderLaps) {
                const lapDiff = leaderLaps - res.laps;
                gapString = `+${lapDiff} ${t("lapsCount", { count: lapDiff })}`;
              } else {
                gapString = `+${((res.totalTime - leaderTime) / 1000).toFixed(3)}s`;
              }
            }

            return {
              guid: res.driver?.guid || `unknown-${index}`,
              pos: res.position || index + 1,
              name: res.driver?.mainName || t("unknownDriver"),
              car: res.car ? res.car.replace(/_/g, " ") : t("unknownCar"),
              laps: res.laps,
              totalTime: res.totalTime,
              bestLap: res.bestLap,
              gap: gapString,
              eloBefore: res.eloBefore,
              eloAfter: res.eloAfter,
              eloChange: res.eloAfter - res.eloBefore,
              combo: res.combo,
            };
          }
        );

        setResults(mappedResults);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading race data:", err);
        setLoading(false);
      });
  }, [id, t]);

  // WCAG: Dynamiczne zarządzanie tytułem dokumentu
  useEffect(() => {
    if (raceInfo?.name) {
      document.title = `${t("metaTitle")} - ${raceInfo.name}`;
    } else if (loading) {
      document.title = t("metaLoading");
    } else {
      document.title = t("metaNotFound");
    }
  }, [raceInfo, loading, t]);

  // STAN ŁADOWANIA
  if (loading) {
    return (
      <Box
        component="div"
        role="status"
        aria-live="polite"
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        sx={{ backgroundColor: 'var(--color-brand-navy)' }}
      >
        <LoadingSpinner className="py-2 px-4" />
        <Typography variant="srOnly">{t("metaLoading")}</Typography>
      </Box>
    );
  }

  // STAN BŁĘDU / BRAKU DANYCH
  if (!raceInfo || results.length === 0) {
    return (
      <Box 
        className="min-h-screen flex items-center justify-center p-4"
        sx={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text)' }}
      >
        <Container 
          maxWidth="md" 
          className="p-8 text-center shadow-xl border flex flex-col items-center gap-4"
          sx={{
            backgroundColor: 'var(--color-brand-navy-dark)',
            borderColor: 'color-mix(in srgb, var(--color-brand-navy-light) 40%, transparent)',
            borderRadius: 'var(--radius-brand-card)'
          }}
        >
          <Typography 
            variant="h6" 
            className="font-bold text-[var(--color-elo-loss)]"
          >
            {t("notFoundMessage")}
          </Typography>
          
          <BackButton fallbackHref="/events" ariaLabel={t("backButton")} />
        </Container>
      </Box>
    );
  }

  // WŁAŚCIWY LAYOUT STRONY
  return (
    <Box 
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      sx={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text)' }}
    >
      <Container maxWidth="lg" component="main" className="p-0!">

        {/* Sekcja przycisku powrotu */}
        <Box className="mb-6 flex items-center gap-3">
          <BackButton fallbackHref="/events" ariaLabel={t("backButton")} />
          
          <Typography
            variant="caption"
            aria-hidden="true"
            className="font-mono text-xs uppercase tracking-wider select-none"
            sx={{ color: 'var(--color-brand-text-muted)' }}
          >
            {t("backButton")}
          </Typography>
        </Box>

        {/* Sekcja informacji o wyścigu */}
        <RaceInfo info={raceInfo} />

        {/* Tabela z wynikami */}
        <ResultList results={results} />

      </Container>
    </Box>
  );
}