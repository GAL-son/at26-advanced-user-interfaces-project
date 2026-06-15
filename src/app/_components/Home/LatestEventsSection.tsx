"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import EventRow from '../Events/EventRow';
import { FormattedEvent } from '@/lib/services/events';
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

interface LatestEventsSectionProps {
  events: FormattedEvent[];
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function LatestEventsSection({ events, onNavigateVertical }: LatestEventsSectionProps) {
  const t = useTranslations("Home");

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: events.length,
    orientation: "horizontal", // Pionowa nawigacja idealnie pasuje do sekwencyjnego skanowania wydarzeń
    loop: false,
    onLeave: (direction) => {
      if (onNavigateVertical) {
        onNavigateVertical(direction === "prev" ? "up" : "down");
      }
    }
  });

  if (!events || events.length === 0) return null;

  return (
    <section
      className="w-full my-8 animate-fadeIn focus:outline-none"
      aria-labelledby="latest-events-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="latest-events-heading"
          className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[var(--color-brand-text)]"
        >
          {t("latestEvents")}
        </h2>
      </div>

      {/* 🟢 CZYSTA SEMANTYKA: ul ma jako bezpośrednie dzieci komponenty EventRow, które są tagami <li> */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 list-none p-0 m-0">
        {events.map((event, index) => (
          <EventRow
            key={event.id}
            event={event}
            id={event.id}
            tabIndex={0}
            ref={registerItem(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ul>
    </section>
  );
}