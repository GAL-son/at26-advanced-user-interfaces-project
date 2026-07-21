"use client";
import React from 'react';

export interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  guid: string;
  color: string;
  isMobile?: boolean;
  index?: number;                // Wstrzykiwane automatycznie przez Recharts
  keyboardFocusedIndex?: number | null; // Przekazywane przez nas z EloChart
}

export default function EventDot({
  cx,
  cy,
  payload,
  guid,
  color,
  isMobile = false,
  index,
  keyboardFocusedIndex,
}: EventDotProps) {
  if (!payload || cx === undefined || cy === undefined) return null;

  const meta = payload[`meta_${guid}`];

  // Jeśli kierowca nie jechał w tym wyścigu, nie renderujemy punktu
  if (!meta || !meta.hasRaced) return null;

  // Sprawdzamy, czy ta konkretna kropka jest aktualnie podświetlona klawiaturą
  const isFocusedByKeyboard = keyboardFocusedIndex !== null && keyboardFocusedIndex === index;

  return (
    <g aria-hidden="true">
      {/* Niewidzialny obszar dotykowy */}
      <circle
        cx={cx}
        cy={cy}
        r={isMobile ? 14 : 8}
        fill="transparent"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Wizualna kropka wykresu */}
      <circle
        cx={cx}
        cy={cy}
        // NOWOŚĆ: Jeśli punkt jest aktywny na klawiaturze, powiększamy go (symulacja hoveru)
        r={isFocusedByKeyboard ? (isMobile ? 7.5 : 6) : (isMobile ? 5 : 3.5)}
        fill={isFocusedByKeyboard ? color : "var(--color-brand-navy-dark)"}
        stroke={color}
        // Pogrubienie ramki dla aktywnego elementu
        strokeWidth={isFocusedByKeyboard ? 2 : (isMobile ? 2.5 : 2)}
        style={{
          transition: "all 0.15s ease-out", // Płynne animowanie powiększenia z klawiatury
          pointerEvents: "none",
        }}
      />
    </g>
  );
}