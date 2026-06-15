"use client";
import React from 'react';

export interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  guid: string;
  color: string;
  isMobile?: boolean;
}

export default function EventDot({
  cx,
  cy,
  payload,
  guid,
  color,
  isMobile = false,
}: EventDotProps) {
  if (!payload || cx === undefined || cy === undefined) return null;

  const meta = payload[`meta_${guid}`];

  // Jeśli kierowca nie jechał w tym wyścigu, nie renderujemy punktu
  if (!meta || !meta.hasRaced) return null;

  return (
    // Pakujemy w grupę <g> i ukrywamy przed czytnikiem (cała tabela jest już w sr-only wyżej)
    <g aria-hidden="true">
      {/* WCAG FIX: Niewidzialny, powiększony obszar dotykowy (Pointer Target).
        Zapewnia łatwiejsze najechanie myszką lub tąpnięcie palcem na mobile,
        nie psując przy tym minimalistycznego designu wykresu.
      */}
      <circle
        cx={cx}
        cy={cy}
        r={isMobile ? 14 : 8} // Znacznie większy promień przechwytywania zdarzeń
        fill="transparent"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Wizualna, pierwotna kropka wykresu */}
      <circle
        cx={cx}
        cy={cy}
        r={isMobile ? 5 : 3.5}
        fill="var(--color-brand-navy-dark)"
        stroke={color}
        strokeWidth={isMobile ? 2.5 : 2}
        style={{
          transition: "stroke 0.3s ease",
          pointerEvents: "none", // Blokujemy zdarzenia myszy na małej kropce, by to ta duża zbierała hover
        }}
      />
    </g>
  );
}