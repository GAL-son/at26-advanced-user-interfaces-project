"use client";

import React from "react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import BrandCard from "@/app/_components/Common/BrandCard";
import { MapPin, Calendar, Server } from "lucide-react";

export interface RaceEvent {
  id: string;
  server: string;
  track: string;
  date: Date;
  name: string;
}

interface EventCardProps {
  event: RaceEvent;
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export default function EventCard({ event, id, onKeyDown }: EventCardProps) {
  const format = useFormatter();
  const tEvents = useTranslations("Events");
  const tResults = useTranslations("Results.info");

  // Formatowanie i czyszczenie danych wejściowych
  const readableName = event.name || tResults("unnamedEvent");
  const readableTrack = event.track.replace(/_/g, " ");
  const cleanServer = event.server.replace("https://", "");
  const targetUrl = `/events/${event.id}`;

  const dateObj = new Date(event.date);
  const formattedDate = isNaN(dateObj.getTime())
    ? "N/A"
    : format.dateTime(dateObj, {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <BrandCard
      as="li"
      id={id}
      className="group"
      interactive={true}
    >
      <Link
        href={targetUrl}
        onKeyDown={onKeyDown}
        draggable={false}
        className="flex flex-col justify-between h-full w-full gap-5 text-left focus:outline-none"
        aria-label={tEvents("list.rowAriaLabel", {
          name: readableName,
          track: readableTrack,
          date: formattedDate,
          server: cleanServer,
        })}
      >
        <div className="flex flex-col gap-2 w-full min-w-0">
          {/* Nazwa eventu */}
          <h2 className="text-card-title uppercase group-hover:text-[var(--color-brand-yellow-hover)] group-focus-visible:text-[var(--color-brand-yellow-hover)] transition-colors duration-200 text-[var(--color-brand-text)]">
            {readableName}
          </h2>

          {/* Tor wyścigowy */}
          <div className="font-semibold tracking-normal text-xs sm:text-sm flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[var(--color-brand-text-muted)]/90">
            <MapPin
              size={16}
              aria-hidden="true"
              className="text-[var(--color-brand-yellow-hover)] shrink-0"
            />
            {readableTrack}
          </div>

          {/* Data eventu */}
          <div className="flex items-center gap-1.5 mt-1 text-[var(--color-brand-text-muted)]/70 text-btn-mono">
            <Calendar size={14} aria-hidden="true" className="text-[var(--color-brand-text-muted)]/70" />
            <span className="sr-only">{tResults("raceDate")}: </span>
            {formattedDate}
          </div>
        </div>

        {/* Sekcja dolna z parametrami serwera */}
        <div className="w-full pt-3 border-t border-[var(--color-brand-navy-light)]/40 shrink-0">
          <div className="font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-[var(--color-brand-navy)] border border-[var(--color-brand-navy-light)] text-[var(--color-brand-text-muted)] text-btn-mono">
            <Server size={14} aria-hidden="true" className="text-[var(--color-brand-text-muted)]" />
            <span className="sr-only">{tResults("serverStatus")}: </span>
            {cleanServer}
          </div>
        </div>
      </Link>
    </BrandCard>
  );
}