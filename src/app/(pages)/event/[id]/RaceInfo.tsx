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
      sx={{ 
        p: 0, 
        mb: 4, 
        backgroundImage: 'none',
        backgroundColor: 'transparent' 
      }}
      // Zmieniono: border-brand-navy-light dopasuje się do jasnej/ciemnej ramki
      className="bg-brand-navy-dark border-l-4 border-brand-yellow rounded-r-xl border-y border-r border-brand-navy-light overflow-hidden shadow-xl"
    >
      <Box className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* LEWA STRONA: Nazwa wydarzenia i Tor */}
        <Box className="space-y-2">
          <Typography
            id="race-info-title"
            variant="h4"
            component="h1"
            // Zmieniono: !text-brand-muted (zamiast !text-slate-100) - da ciemny navy/szary w jasnym i jasny w ciemnym
            className="!text-brand-muted !font-black tracking-tight uppercase text-2xl sm:text-3xl"
          >
            {info.eventName || "Unnamed Event"}
          </Typography>
          
          <Box className="flex items-center gap-2 text-brand-yellow font-mono text-sm uppercase tracking-wider font-semibold">
            <FlagIcon sx={{ fontSize: '1.2rem' }} />
            <span>Track: {readableTrack}</span>
          </Box>
        </Box>

        {/* PRAWA STRONA: Szczegóły (Data i Serwer) */}
        <Box className="flex flex-wrap md:flex-nowrap gap-4 items-stretch">
          
          {/* Kafelek: Data */}
          <Box className="bg-brand-navy/40 border border-brand-navy-light rounded-lg p-3 flex items-center gap-3 min-w-[200px]">
            {/* Zmieniono: text-brand-muted/80 (zamiast text-slate-400) */}
            <Box className="p-2 bg-brand-navy-light/50 rounded text-brand-muted/80">
              <CalendarTodayIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col">
              <span className="text-[10px] !text-brand-muted/60 uppercase tracking-widest font-bold">Race Date</span>
              {/* Zmieniono: !text-brand-muted */}
              <span className="!text-brand-muted text-sm font-medium font-mono">{formattedDate}</span>
            </Box>
          </Box>

          {/* Kafelek: Serwer */}
          <a 
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Join server: ${info.server}`}
            className="bg-brand-navy/40 border border-brand-navy-light hover:border-brand-yellow/40 rounded-lg p-3 flex items-center gap-3 min-w-[200px] transition-all group"
          >
            {/* Zmieniono: text-brand-muted/80 */}
            <Box className="p-2 bg-brand-navy-light/50 rounded text-brand-muted/80 group-hover:!text-brand-yellow transition-colors">
              <DnsIcon fontSize="small" />
            </Box>
            <Box className="flex flex-col">
              <span className="text-[10px] !text-brand-muted/60 uppercase tracking-widest font-bold group-hover:!text-brand-yellow transition-colors">Server Status</span>
              {/* Zmieniono: !text-brand-muted/90 */}
              <span className="!text-brand-muted/90 text-xs font-mono truncate max-w-[150px] group-hover:underline">
                {info.server}
              </span>
            </Box>
          </a>

        </Box>
      </Box>
    </Paper>
  );
}