// src/app/_components/Home/LatestEventsSection.tsx

import React from 'react';
import EventRow from '../Events/EventRow';
import { FormattedEvent } from '@/lib/services/events';

interface LatestEventsSectionProps {
  events: FormattedEvent[];
}

export default function LatestEventsSection({ events }: LatestEventsSectionProps) {
  if (!events || events.length === 0) return null;

  return (
    <section 
      className="w-full my-8 animate-fadeIn" 
      aria-labelledby="latest-events-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 
          id="latest-events-heading" 
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          Ostatnie Wyścigi
        </h2>
      </div>

      {/* Siatka (Grid) z listą semantyczną dla czytników ekranu */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {events.map((event) => (
          /* DOBRZE: Usunęliśmy stąd tag <li>, EventRow sam jest elementem listy */
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
    </section>
  );
}