"use client";
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
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
        borderLeftColor: 'var(--color-brand-yellow)', // Stały, złoty akcent po lewej stronie
        transition: 'all 0.3s ease',
      }}
    >
      <Box className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* LEWA STRONA: Nazwa wydarzenia i Tor */}
        <Box className="space-y-2">
          <Typography
            id="race-info-title"
            variant="h4"
            component="h1"
            className="font-black tracking-tight uppercase text-2xl sm:text-3xl"
            sx={{ color: 'var(--color-brand-text)' }} // Główny tekst (Slate 900 w light / Slate 50 w dark)
          >
            {info.eventName || "Unnamed Event"}
          </Typography>
          
          <Box 
            className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider font-semibold"
            sx={{ color: 'var(--color-brand-yellow-text)' }} // Bezpieczny żółty dla tekstu
          >
            <FlagIcon sx={{ fontSize: '1.2rem', color: 'var(--color-brand-yellow-hover)' }} />
            <span>Track: {readableTrack}</span>
          </Box>
        </Box>

        {/* PRAWA STRONA: Szczegóły (Data i Serwer) */}
        <Box className="flex flex-wrap md:flex-nowrap gap-4 items-stretch">
          
          {/* Kafelek: Data */}
          <Box 
            className="rounded-lg p-3 flex items-center gap-3 min-w-[200px]"
            sx={{
              backgroundColor: 'var(--color-brand-navy)',
              border: '1px solid var(--color-brand-navy-light)',
            }}
          >
            <Box 
              className="p-2 rounded" 
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text-muted) 12%, transparent)',
                color: 'var(--color-brand-text-muted)' 
              }}
            >
              <CalendarTodayIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col">
              <span 
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Race Date
              </span>
              <span 
                className="text-sm font-medium font-mono"
                style={{ color: 'var(--color-brand-text)' }}
              >
                formattedDate
              </span>
            </Box>
          </Box>

          {/* Kafelek: Serwer */}
          <Box
            component="a" 
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Join server: ${info.server}`}
            className="rounded-lg p-3 flex items-center gap-3 min-w-[200px] transition-all no-underline"
            sx={{
              backgroundColor: 'var(--color-brand-navy)',
              border: '1px solid var(--color-brand-navy-light)',
              '&:hover': {
                borderColor: 'var(--color-brand-yellow-hover)',
              },
              // Selektory hover dla dzieci kafelka (efekt 'group-hover' w czystym CSS)
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
              className="p-2 rounded server-icon transition-colors duration-200" 
              sx={{ 
                backgroundColor: 'color-mix(in srgb, var(--color-brand-text-muted) 12%, transparent)',
                color: 'var(--color-brand-text-muted)' 
              }}
            >
              <DnsIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col truncate">
              <span 
                className="text-[10px] uppercase tracking-widest font-bold server-title transition-colors duration-200"
                style={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
              >
                Server Status
              </span>
              <span 
                className="text-xs font-mono truncate max-w-[150px] server-link transition-colors duration-200"
                style={{ color: 'var(--color-brand-text-muted)' }}
              >
                {info.server}
              </span>
            </Box>
          </Box>

        </Box>
      </Box>
    </Paper>
  );
}