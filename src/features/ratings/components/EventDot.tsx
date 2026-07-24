"use client";
import React from 'react';

export interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  guid: string;
  color: string;
  isMobile?: boolean;
  index?: number;
  keyboardFocusedIndex?: number | null;
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

  if (!meta || !meta.hasRaced) return null;

  const isFocusedByKeyboard = keyboardFocusedIndex !== null && keyboardFocusedIndex === index;

  return (
    <g aria-hidden="true">
      <circle
        cx={cx}
        cy={cy}
        r={isMobile ? 14 : 8}
        fill="transparent"
        style={{ cursor: 'pointer' }}
      />
      
      <circle
        cx={cx}
        cy={cy}
        r={isFocusedByKeyboard ? (isMobile ? 7.5 : 6) : (isMobile ? 5 : 3.5)}
        fill={isFocusedByKeyboard ? color : "var(--color-brand-navy-dark)"}
        stroke={color}
        strokeWidth={isFocusedByKeyboard ? 2 : (isMobile ? 2.5 : 2)}
        style={{
          transition: "all 0.15s ease-out",
          pointerEvents: "none",
        }}
      />
    </g>
  );
}