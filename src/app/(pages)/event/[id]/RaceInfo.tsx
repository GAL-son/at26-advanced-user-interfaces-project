"use client";
import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import DnsIcon from '@mui/icons-material/Dns';

interface RaceInfoProps {
  info: {
    id: string;
    eventName: string;
    track: string;
    date: string;
    server: string;
  };
}

export default function RaceInfo({ info }: RaceInfoProps) {
  const formattedDate = new Date(info.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const readableTrack = info.track.replace(/_/g, ' ');
  const serverUrl = info.server.startsWith('http') ? info.server : `https://${info.server}`;

  return (
    <Paper
      elevation={0}
      component="section" // Semantyczny tag HTML5 dla dostępności (WCAG)
      aria-labelledby="race-info-title"
      sx={{
        p: 3,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography
        id="race-info-title"
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
      >
        {info.eventName || "Wyścig bez nazwy"}
      </Typography>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1.5, 
          flexWrap: 'wrap', 
          alignItems: 'center' 
        }}
      >
        {/* Główny punkt programu: Tor */}
        <Chip 
          icon={<FlagIcon aria-hidden="true" />}
          label={`Tor: ${readableTrack}`} 
          variant="outlined" 
          color="primary"
          sx={{ fontWeight: 600, px: 0.5 }}
        />

        {/* Ważny punkt programu: Data */}
        <Chip 
          icon={<CalendarTodayIcon aria-hidden="true" />}
          label={`Data: ${formattedDate}`} 
          variant="outlined" 
          sx={{ px: 0.5 }}
        />

        {/* Serwer - Zgodnie z wytycznymi: niższy priorytet wizualny (mniejszy i dyskretny) */}
        <Chip 
          component="a"
          href={serverUrl}
          target="_blank"
          rel="noopener noreferrer"
          clickable
          icon={<DnsIcon fontSize="small" aria-hidden="true" />}
          label={`Serwer: ${info.server}`} 
          size="small"
          variant="text" // Brak obramowania (border: none)
          aria-label={`Przejdź do panelu serwera: ${info.server}`}
          sx={{ 
            fontSize: '0.75rem', 
            color: 'primary.main', // Zmiana koloru na linkowy, sygnalizująca klikalność
            backgroundColor: 'transparent', // Brak tła
            height: '24px',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              backgroundColor: 'transparent', // Blokada domyślnego tła MUI na hoverze
            },
            '& .MuiChip-icon': {
              fontSize: '0.9rem',
              color: 'primary.main'
            }
          }}
        />
      </Box>

      {/* Miejsce na przyszłe API z mapami i krajami torów */}
      {/* <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
         <Typography variant="body2" color="text.secondary">
           [Tutaj w przyszłości wyląduje komponent mapy i flaga kraju dla toru: {readableTrack}]
         </Typography>
      </Box> 
      */}
    </Paper>
  );
}