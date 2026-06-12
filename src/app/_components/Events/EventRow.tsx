"use client";
import React from 'react';
import ListWrapper from '@/app/_components/Events/ListItem';
import { Box, Typography, ButtonBase } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import SpeedIcon from '@mui/icons-material/Speed';

interface EventRowProps {
  event: {
    id: string;
    server: string;
    track: string;
    date: string;
    jsonUrl: string;
  };
}

export default function EventRow({ event }: EventRowProps) {
  const readableTrack = event.track.replace(/_/g, ' ');
  const cleanServer = event.server.replace('https://', '');
  const formattedDate = new Date(event.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const targetUrl = `/events/${event.id}`;

  return (
    <ListWrapper>
      <ButtonBase
        component="a"
        href={targetUrl}
        aria-label={`Race at ${readableTrack}, date: ${formattedDate}, server: ${cleanServer}. View detailed results.`}
        sx={{
          width: '100%',
          p: 2.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 4 },
          textAlign: 'left',
          
          // Efekt hover, który wykorzystuje ujednolicony przez nas globalny styl podświetlenia wierszy
          '&:hover': {
            backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 4%, var(--color-brand-navy-dark)) !important',
          },
          '&:focus-visible': {
            outline: '2px solid var(--color-brand-yellow-hover)',
            outlineOffset: '-2px',
          },
        }}
        className="group"
      >
        {/* Lewa strona: Tor oraz Czas wyścigu */}
        <Box 
          className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 flex-grow min-w-0"
        >
          {/* NAZWA TORU */}
          <Typography 
            variant="body1" 
            component="h2" 
            className="font-black tracking-wide uppercase transition-colors duration-200 flex items-center gap-2 text-base sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis"
            sx={{ 
              color: 'var(--color-brand-text)', // Główny, wyraźny tekst dla nazwy toru
              '.group:hover &': {
                color: 'var(--color-brand-yellow-text) !important' // Bezpieczna żółć na hover całego wiersza
              }
            }}
          >
            <SpeedIcon 
              fontSize="small" 
              aria-hidden="true" 
              sx={{ color: 'var(--color-brand-yellow-hover)' }} 
            />
            {readableTrack}
          </Typography>

          {/* DATA WYŚCIGU */}
          <Typography 
            variant="body2" 
            className="font-mono text-sm flex items-center gap-1.5 whitespace-nowrap"
            sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.8 }}
          >
            <EventIcon sx={{ fontSize: '1.1rem', color: 'var(--color-brand-text-muted)' }} aria-hidden="true" />
            <Box component="span" className="hidden">Race date: </Box>
            {formattedDate}
          </Typography>
        </Box>

        {/* Prawa strona: Serwer (Esportowy tag telemetryczny) */}
        <Box 
          className="self-start sm:self-center sm:ml-auto flex-shrink-0"
        >
          <Typography 
            variant="body2" 
            className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5"
            sx={{
              color: 'var(--color-brand-text-muted)',
              backgroundColor: 'var(--color-brand-navy)', // Dopasowane tło taga
              border: '1px solid var(--color-brand-navy-light)',
            }}
          >
            <StorageIcon sx={{ fontSize: '1rem', color: 'var(--color-brand-text-muted)' }} aria-hidden="true" />
            <Box component="span" className="hidden">Server: </Box>
            {cleanServer}
          </Typography>
        </Box>
      </ButtonBase>
    </ListWrapper>
  );
}