"use client";
import React from 'react';
import ListWrapper from '@/app/_components/Events/ListItem';
import { Box, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';

interface EventRowProps {
  event: {
    id: string;
    name: string;
    server: string;
    track: string;
    date: string;
    jsonUrl: string;
  };
}

export default function EventRow({ event }: EventRowProps) {
  const readableName = event.name || "Unnamed Event";
  const readableTrack = event.track.replace(/_/g, ' ');
  const cleanServer = event.server.replace('https://', '');
  const formattedDate = new Date(event.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const targetUrl = `/events/${event.id}`;

  return (
    <ListWrapper className="h-full !p-0">
      <Link
        href={targetUrl}
        aria-label={`Event: ${readableName}, Track: ${readableTrack}, Date: ${formattedDate}, Server: ${cleanServer}. View detailed results.`}
        className="group flex flex-col p-6 items-start justify-between gap-6 text-left w-full h-full rounded-[var(--radius-brand-card,12px)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow-hover)]"
        style={{ textDecoration: 'none' }}
      >
        {/* Góra kafelka: Nazwa, Tor oraz Data */}
        <Box className="flex flex-col gap-2 w-full min-w-0">
          
          {/* NAZWA EVENTU */}
          <Typography 
            variant="body1" 
            component="h2" 
            className="font-black tracking-wide uppercase transition-colors duration-200 text-base sm:text-lg overflow-hidden text-ellipsis group-hover:text-[var(--color-brand-yellow-hover)]"
            sx={{ 
              color: 'var(--color-brand-text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              whiteSpace: 'normal',
            }}
          >
            {readableName}
          </Typography>

          {/* NAZWA TORU */}
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
        <Box className="w-full pt-2 border-t border-[var(--color-brand-navy-light)]/40 flex-shrink-0">
          <Typography 
            variant="body2" 
            component="div"
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
      </Link>
    </ListWrapper>
  );
}