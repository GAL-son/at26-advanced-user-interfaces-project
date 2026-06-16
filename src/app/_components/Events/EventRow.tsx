"use client";
import React from 'react';
import ListItem from '@/app/_components/Events/ListItem';
import { Box, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useFormatter, useTranslations } from 'next-intl';

interface EventRowProps extends Omit<React.ComponentPropsWithoutRef<typeof ListItem>, 'children' | 'href'> {
  event: {
    id: string;
    name: string;
    server: string;
    track: string;
    date: string;
  };
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  id?: string;
}

const EventRow = React.forwardRef<HTMLAnchorElement, EventRowProps>(
  ({ event, onKeyDown, id, ...rest }, ref) => {
    const format = useFormatter();
    const tEvents = useTranslations("Events");
    const tResults = useTranslations("Results.info");

    const readableName = event.name || tResults("unnamedEvent");
    const readableTrack = event.track.replace(/_/g, ' ');
    const cleanServer = event.server.replace('https://', '');

    const targetUrl = `/events/${event.id}`;

    const dateObj = new Date(event.date);
    const formattedDate = isNaN(dateObj.getTime())
      ? "N/A"
      : format.dateTime(dateObj, {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

    return (
      <ListItem
        ref={ref}
        id={id}
        href={targetUrl}
        onKeyDown={onKeyDown}
        // 🌐 Wszystkie parametry dynamiczne trafiają do jednego, zlokalizowanego ciągu ARIA
        aria-label={tEvents("list.rowAriaLabel", {
          name: readableName,
          track: readableTrack,
          date: formattedDate,
          server: cleanServer
        })}
        className="p-6 items-start justify-between gap-6 text-left h-full"
        draggable={false}
        {...rest}
      >
        <Box className="flex flex-col gap-2 w-full min-w-0">
          <Typography variant="body1" component="h2" className="font-black uppercase text-base sm:text-lg group-hover:text-[var(--color-brand-yellow-hover)] group-focus-visible:text-[var(--color-brand-yellow-hover)] transition-colors duration-200">
            {readableName}
          </Typography>

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

          <Typography
            variant="body2"
            className="font-mono text-xs flex items-center gap-1.5 mt-1"
            sx={{ color: 'var(--color-brand-text-muted)', opacity: 0.7 }}
          >
            <EventIcon sx={{ fontSize: '1rem', color: 'var(--color-brand-text-muted)' }} aria-hidden="true" />
            <Box component="span" className="hidden">{tResults("raceDate")}: </Box>
            {formattedDate}
          </Typography>
        </Box>

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
            <Box component="span" className="hidden">{tResults("serverStatus")}: </Box>
            {cleanServer}
          </Typography>
        </Box>
      </ListItem>
    );
  }
);

EventRow.displayName = 'EventRow';
export default EventRow;