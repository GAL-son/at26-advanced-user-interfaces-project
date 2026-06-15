"use client";
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import DnsIcon from '@mui/icons-material/Dns';
import { useTranslations, useLocale } from 'next-intl';

interface RaceInfoProps {
  info: {
    id: string;
    eventName: string;
    track: string;
    date: string;
    server: string;
  };
  // NOWOŚĆ: Przekazujemy callback do nawigacji pionowej z poziomu strony nadrzędnej
  onNavigateVertical: (direction: "up" | "down") => void;
}

export default function RaceInfo({ info, onNavigateVertical }: RaceInfoProps) {
  const t = useTranslations("Results.info");
  const locale = useLocale();

  const formattedDate = new Date(info.date).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const readableTrack = info.track.replace(/_/g, ' ');
  const serverUrl = info.server.startsWith('http') ? info.server : `https://${info.server}`;

  // Ręczna obsługa wyjścia z kafelka-linku w pionie
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onNavigateVertical("down");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigateVertical("up");
    }
  };

  return (
    <Paper
      elevation={0}
      component="section"
      aria-labelledby="race-info-title"
      className="group border-l-4 rounded-r-xl overflow-hidden shadow-xl"
      sx={{ 
        p: 0, 
        mb: 4, 
        backgroundImage: 'none',
        backgroundColor: 'var(--color-brand-navy-dark)',
        borderTop: '1px solid var(--color-brand-navy-light)',
        borderRight: '1px solid var(--color-brand-navy-light)',
        borderBottom: '1px solid var(--color-brand-navy-light)',
        borderLeftColor: 'var(--color-brand-yellow)',
        transition: 'all 0.3s ease',
      }}
    >
      <Box className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* LEWA STRONA: Nazwa wydarzenia i Tor */}
        <Box className="space-y-2 min-w-0">
          <Typography
            id="race-info-title"
            variant="h4"
            component="h1"
            className="font-black tracking-tight uppercase text-2xl sm:text-3xl truncate"
            sx={{ color: 'var(--color-brand-text)' }}
          >
            {info.eventName || t("unnamedEvent")}
          </Typography>
          
          <Box 
            className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider font-semibold"
            sx={{ color: 'var(--color-brand-yellow-text)' }}
          >
            <FlagIcon sx={{ fontSize: '1.2rem', color: 'var(--color-brand-yellow-hover)' }} />
            <span className="truncate">
              {t("track")}: {readableTrack}
            </span>
          </Box>
        </Box>

        {/* PRAWA STRONA: Szczegóły (Data i Serwer) */}
        <Box className="flex flex-wrap md:flex-nowrap gap-4 items-stretch w-full md:w-auto">
          
          {/* Kafelek: Data */}
          <Box 
            className="rounded-lg p-3 flex items-center gap-3 w-full sm:flex-1 md:w-[220px]"
            sx={{
              backgroundColor: 'var(--color-brand-navy)',
              border: '1px solid var(--color-brand-navy-light)',
            }}
          >
            <Box 
              className="p-2 rounded flex-shrink-0" 
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text-muted) 12%, transparent)',
                color: 'var(--color-brand-text-muted)' 
              }}
            >
              <CalendarTodayIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col min-w-0">
              <Box 
                component="span"
                className="text-[10px] uppercase tracking-widest font-bold opacity-70"
                sx={{ color: 'var(--color-brand-text-muted)' }}
              >
                {t("raceDate")}
              </Box>
              <Box 
                component="span"
                className="text-sm font-medium font-mono truncate"
                sx={{ color: 'var(--color-brand-text)' }}
              >
                {formattedDate}
              </Box>
            </Box>
          </Box>

          {/* Kafelek: Serwer */}
          <Box
            component="a" 
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("joinServer")}: ${info.server} (${t("newWindow")})`}
            tabIndex={0} // Zapewnia, że element wchodzi do sekwencji tabowania klawiatury
            onKeyDown={handleKeyDown}
            // Implementacja klasy focus-brand dla spójnego wyglądu obwódki
            className="rounded-lg p-3 flex items-center gap-3 w-full sm:flex-1 md:w-[220px] transition-all no-underline focus-brand"
            sx={{
              backgroundColor: 'var(--color-brand-navy)',
              border: '1px solid var(--color-brand-navy-light)',
              
              // Wyczyszczenie domyślnych stylów focusu dla linku
              "&:focus, &:focus-visible": {
                outline: "none",
              },

              '&:hover': {
                borderColor: 'var(--color-brand-yellow-hover)',
              },
              '&:hover .server-icon': {
                color: 'var(--color-brand-yellow-text)',
              },
              '&:hover .server-title': {
                color: 'var(--color-brand-yellow-text)',
              },
              '&:hover .server-link': {
                color: 'var(--color-brand-text)',
                textDecoration: 'underline',
              }
            }}
          >
            <Box 
              className="p-2 rounded server-icon flex-shrink-0 transition-colors duration-200" 
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text-muted) 12%, transparent)',
                color: 'var(--color-brand-text-muted)' 
              }}
            >
              <DnsIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col min-w-0 w-full">
              <Box 
                component="span"
                className="text-[10px] uppercase tracking-widest font-bold server-title transition-colors duration-200 opacity-70"
                sx={{ color: 'var(--color-brand-text-muted)' }}
              >
                {t("serverStatus")}
              </Box>
              <Box 
                component="span"
                className="text-xs font-mono truncate server-link transition-colors duration-200"
                sx={{ color: 'var(--color-brand-text-muted)' }}
              >
                {info.server}
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Paper>
  );
}