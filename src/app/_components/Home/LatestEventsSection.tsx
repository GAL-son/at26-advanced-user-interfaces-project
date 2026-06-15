// src/app/_components/Home/LatestEventsSection.tsx
"use client";

import React from 'react';
import EventRow from '../Events/EventRow';
import { FormattedEvent } from '@/lib/services/events';
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

interface LatestEventsSectionProps {
  events: FormattedEvent[];
  // Callback do rodzica, żeby wiedział kiedy wyjść z tej sekcji w górę lub w dół
  onNavigateVertical?: (direction: "up" | "down") => void;
}

export default function LatestEventsSection({ events, onNavigateVertical }: LatestEventsSectionProps) {
  
  // Inicjalizacja hooka dla układu poziomego
  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: events.length,
    orientation: "horizontal",
    loop: false,
    onLeave: (direction) => {
      if (onNavigateVertical) {
        // 'prev' (strzałka w górę) -> idziemy do góry, 'next' (strzałka w dół) -> idziemy w dół
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
          Ostatnie Wyścigi
        </h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {events.map((event, index) => (
          <EventRow 
            key={event.id} 
            event={event}
            // ZMIANA: Zamiast customowego domRef, przekazujemy natywny ref
            ref={registerItem(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ul>
    </section>
  );
}