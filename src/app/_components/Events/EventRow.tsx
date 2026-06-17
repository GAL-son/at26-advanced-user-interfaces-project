"use client";
import React from 'react';
import ListItem from '@/app/_components/Events/ListItem';
import { Box, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useFormatter, useTranslations } from 'next-intl';

export interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: string;
  name: string;
}

interface EventRowProps extends Omit<React.ComponentPropsWithoutRef<typeof ListItem>, 'children' | 'href'> {
  event: RaceEvent,
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
          {/* Nazwa eventu - ma już w sobie !text-card-title (czyli font-display/sans) */}
          <Typography 
            variant="body1" 
            component="h2" 
            className="uppercase group-hover:text-brand-yellow-hover group-focus-visible:text-brand-yellow-hover transition-colors duration-200 !text-card-title"
          >
            {readableName}
          </Typography>

          {/* TUTAJ BYŁ PROBLEM: Dodano !font-sans, aby odciąć domyślny font z MUI */}
          <Typography
            variant="body2"
            className="font-semibold tracking-normal text-xs sm:text-sm flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap !font-sans !text-brand-text-muted/90"
          >
            <LocationOnIcon
              fontSize="small"
              aria-hidden="true"
              className="text-brand-yellow-hover flex-shrink-0 !text-[1.1rem]"
            />
            {readableTrack}
          </Typography>

          {/* Data eventu - używa !text-btn-mono (Share Tech Mono) */}
          <Typography
            variant="body2"
            className="flex items-center gap-1.5 mt-1 !text-brand-text-muted/70 !text-btn-mono"
          >
            <EventIcon className="!text-[1rem] !text-brand-text-muted/70" aria-hidden="true" />
            <Box component="span" className="hidden">{tResults("raceDate")}: </Box>
            {formattedDate}
          </Typography>
        </Box>

        {/* Sekcja dolna z parametrami serwera - używa !text-btn-mono (Share Tech Mono) */}
        <Box className="w-full pt-2 border-t border-brand-navy-light/40 flex-shrink-0">
          <Typography
            variant="body2"
            component="div"
            className="font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-brand-navy border border-brand-navy-light !text-brand-text-muted !text-btn-mono"
          >
            <StorageIcon className="!text-[0.9rem] !text-brand-text-muted" aria-hidden="true" />
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