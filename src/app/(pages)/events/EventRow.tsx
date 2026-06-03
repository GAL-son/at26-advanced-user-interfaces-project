"use client";
import React from 'react';
import { Box, Typography, Paper, ButtonBase } from '@mui/material';
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

  const targetUrl = `/event/${event.id}`;

  return (
    <Paper
      component="li"
      role="listitem"
      elevation={0}
      sx={{
        p: 0,
        mb: 1.5,
        backgroundImage: 'none',
        backgroundColor: 'transparent', // Pełne sterowanie oddane do Tailwind
      }}
      className="bg-brand-navy-dark border border-brand-navy-light rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
    >
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
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'var(--color-brand-navy-light) !important',
          },
          '&:focus-visible': {
            outline: '2px solid var(--color-brand-yellow)',
            outlineOffset: '-2px',
          },
        }}
        className="group"
      >
        {/* Lewa strona: Tor oraz Czas wyścigu */}
        <Box 
          className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 flex-grow min-w-0"
        >
          <Typography 
            variant="body1" 
            component="h2" 
            className="!font-black tracking-wide uppercase !text-brand-muted group-hover:!text-brand-yellow transition-colors flex items-center gap-2 text-base sm:text-lg whiteSpace-nowrap overflow-hidden text-ellipsis"
          >
            <SpeedIcon className="!text-brand-yellow/80" fontSize="small" aria-hidden="true" />
            {readableTrack}
          </Typography>

          <Typography 
            variant="body2" 
            className="!text-brand-muted/70 font-mono text-sm flex items-center gap-1.5 whiteSpace-nowrap"
          >
            <EventIcon sx={{ fontSize: '1.1rem' }} aria-hidden="true" />
            <Box component="span" className="hidden">Race date: </Box>
            {formattedDate}
          </Typography>
        </Box>

        {/* Prawa strona: Serwer (zmień styl z czystego linku na esportowy tag) */}
        <Box 
          className="self-start sm:self-center sm:ml-auto flex-shrink-0"
        >
          <Typography 
            variant="body2" 
            className="!text-brand-muted/80 bg-brand-navy/60 border border-brand-navy-light/80 font-mono text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5"
          >
            <StorageIcon sx={{ fontSize: '1rem' }} aria-hidden="true" />
            <Box component="span" className="hidden">Server: </Box>
            {cleanServer}
          </Typography>
        </Box>
      </ButtonBase>
    </Paper>
  );
}