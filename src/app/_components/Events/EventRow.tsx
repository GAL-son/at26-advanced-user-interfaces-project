"use client";
import React from 'react';
import ListWrapper from '@/app/_components/Events/ListItem';
import { Box, Typography, ButtonBase } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // <-- Nowa ikona lokalizacji

interface EventRowProps {
  event: {
    id: string;
    name: string; // <-- Dodane do interfejsu rowka
    server: string;
    track: string;
    date: string;
    jsonUrl: string;
  };
}

export default function EventRow({ event }: EventRowProps) {
  // Czyszczenie i formatowanie danych tekstowych
  const readableName = event.name || "Unnamed Event";
  const readableTrack = event.track.replace(/_/g, ' ');
  const cleanServer = event.server.replace('https://', '');
  const formattedDate = new Date(event.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const targetUrl = `/events/${event.id}`;

  return (
    <ListWrapper className="h-full">
      <ButtonBase
        component="a"
        href={targetUrl}
        aria-label={`Event: ${readableName}, Track: ${readableTrack}, Date: ${formattedDate}, Server: ${cleanServer}. View detailed results.`}
        sx={{
          width: '100%',
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 3,
          textAlign: 'left',
          borderRadius: 'var(--radius-brand-card, 12px)',
          backgroundColor: 'var(--color-brand-navy-dark)',
          border: '1px solid var(--color-brand-navy-light)',
          
          '&:hover': {
            backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 3%, var(--color-brand-navy-dark)) !important',
          },
          '&:focus-visible': {
            outline: '2px solid var(--color-brand-yellow-hover)',
            outlineOffset: '-2px',
          },
        }}
        className="group animate-fadeIn"
      >
        {/* Góra kafelka: Nazwa, Tor oraz Data */}
        <Box className="flex flex-col gap-2 w-full min-w-0">
          
          {/* NAZWA EVENTU (Główna, największa) */}
          <Typography 
            variant="body1" 
            component="h2" 
            className="font-black tracking-wide uppercase transition-colors duration-200 text-base sm:text-lg overflow-hidden text-ellipsis"
            sx={{ 
              color: 'var(--color-brand-text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              whiteSpace: 'normal',
              
              '.group:hover &': {
                color: 'var(--color-brand-yellow-hover) !important'
              }
            }}
          >
            {readableName}
          </Typography>

          {/* NAZWA TORU (Mniejsza, z ikoną lokalizacji) */}
          <Typography 
            variant="body2" 
            className="font-semibold tracking-normal text-xs sm:text-sm flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap"
            sx={{ 
              color: 'var(--color-brand-text-muted)',
              opacity: 0.9
            }}
          >
            <LocationOnIcon 
              fontSize="small" 
              aria-hidden="true" 
              sx={{ 
                color: 'var(--color-brand-yellow-hover)', 
                fontSize: '1.1rem',
                flexShrink: 0,
              }} 
            />
            {readableTrack}
          </Typography>

          {/* DATA WYŚCIGU */}
          <Typography 
            variant="body2" 
            className="font-mono text-xs flex items-center gap-1.5 mt-1"
            sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
          >
            <EventIcon sx={{ fontSize: '1rem', color: 'var(--color-brand-text-muted)' }} aria-hidden="true" />
            <Box component="span" className="hidden">Race date: </Box>
            {formattedDate}
          </Typography>
        </Box>

        {/* Dół kafelka: Tag serwera */}
        <Box className="w-full pt-2 border-t border-brand-navy-light/40 flex-shrink-0">
          <Typography 
            variant="body2" 
            className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
            sx={{
              color: 'var(--color-brand-text-muted)',
              backgroundColor: 'var(--color-brand-navy)',
              border: '1px solid var(--color-brand-navy-light)',
            }}
          >
            <StorageIcon sx={{ fontSize: '0.9rem', color: 'var(--color-brand-text-muted)' }} aria-hidden="true" />
            <Box component="span" className="hidden">Server: </Box>
            {cleanServer}
          </Typography>
        </Box>
      </ButtonBase>
    </ListWrapper>
  );
}