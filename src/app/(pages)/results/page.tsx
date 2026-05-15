"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Container, Button, Typography, Paper, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [raceData, setRaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      fetch(`/api/fetch-results?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          setRaceData(data);
          setLoading(false);
        });
    }
  }, [url]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!raceData) return <Typography>Nie znaleziono danych.</Typography>;

  const leaderTime = raceData.Result[0]?.TotalTime || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} href="/" sx={{ mb: 4 }}>
        Powrót do listy
      </Button>

      {/* Nagłówek wyścigu */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {raceData.EventName || "Wyścig bez nazwy"}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Tor: ${raceData.TrackName}`} variant="outlined" />
          <Chip label={`Data: ${new Date(raceData.Date).toLocaleString()}`} variant="outlined" />
          <Chip label={`Dystans: ${raceData.SessionConfig.time} min`} color="primary" />
        </Box>
      </Paper>

      {/* Tabela wyników */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table aria-label="Wyniki wyścigu">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Poz.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kierowca</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Samochód</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Okr.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Czas łączny</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Strata</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Najlepsze okr.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {raceData.Result.map((res: any, index: number) => {
              const gap = index === 0 ? "-" : `+${((res.TotalTime - leaderTime) / 1000).toFixed(3)}s`;
              
              return (
                <TableRow key={res.DriverGuid} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>{res.DriverName}</TableCell>
                  <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    {res.CarModel.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>{res.NumLaps}</TableCell>
                  <TableCell>{formatTime(res.TotalTime)}</TableCell>
                  <TableCell color="error.main">{gap}</TableCell>
                  <TableCell sx={{ color: 'success.main' }}>{formatTime(res.BestLap)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

// Funkcja formatująca czas (możesz ją przenieść do utils.ts)
function formatTime(ms: number) {
  if (ms === 0 || !ms) return "-";
  const mins = Math.floor(ms / 60000);
  const secs = ((ms % 60000) / 1000).toFixed(3);
  return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
}