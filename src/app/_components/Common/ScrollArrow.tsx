"use client";

import React from 'react';

type ArrowDirection = 'up' | 'down' | 'left' | 'right';

interface ScrollArrowProps {
  /** Kierunek animacji i ułożenia strzałek */
  direction?: ArrowDirection;
  /** Opcjonalny tekst pomocniczy nad ikoną */
  text?: string;
  /** Dodatkowe klasy CSS przekazywane z zewnątrz */
  className?: string;
  /** Kontrola widoczności elementu */
  visible?: boolean;
}

export default function ScrollArrow({
  direction = 'down',
  text,
  className = '',
  visible = true,
}: ScrollArrowProps) {
  
  const config: Record<ArrowDirection, { container: string; typeClass: string }> = {
    down: {
      container: 'flex-col',
      typeClass: 'dir-down wave-normal',
    },
    up: {
      container: 'flex-col', 
      typeClass: 'dir-up wave-reverse',
    },
    left: {
      container: 'flex-row', 
      typeClass: 'dir-left wave-reverse',
    },
    right: {
      container: 'flex-row',
      typeClass: 'dir-right wave-normal',
    },
  };

  const currentConfig = config[direction];

  return (
    <div 
      className={`flex flex-col items-center justify-center gap-2 p-4 text-center transition-all duration-500 ease-in-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      } ${className} dir-${direction}`}
      // WCAG A11Y: Komponent ma charakter wyłącznie dekoracyjny, ignorowany przez czytniki ekranu
      aria-hidden="true"
    >
      {/* Dynamiczne style wstrzyknięte do standardowego tagu dla pełnej niezależności od bibliotek CSS-in-JS */}
      <style>{`
        .shadow-brand {
          filter: drop-shadow(0 2px 4px var(--color-brand-navy-dark));
        }

        @keyframes text-breathe {
          0%, 100% { opacity: 0.6; transform: translateY(-3px); }
          50%      { opacity: 1;   transform: translateY(1px); }
        }

        .animated-text {
          color: var(--color-brand-yellow);
          animation: text-breathe 2s ease-in-out infinite;
        }

        .dir-down .chevron-v { transform: rotate(0deg); }
        .dir-up .chevron-v   { transform: rotate(180deg); }
        .dir-left .chevron-v { transform: rotate(90deg); }
        .dir-right .chevron-v{ transform: rotate(-90deg); }

        @keyframes breathe-down {
          0%, 100% { opacity: 0.3; transform: rotate(0deg) translateY(-4px); }
          50%      { opacity: 1;   transform: rotate(0deg) translateY(2px); }
        }
        @keyframes breathe-up {
          0%, 100% { opacity: 0.3; transform: rotate(180deg) translateY(-4px); }
          50%      { opacity: 1;   transform: rotate(180deg) translateY(2px); }
        }
        @keyframes breathe-left {
          0%, 100% { opacity: 0.3; transform: rotate(90deg) translateY(-4px); }
          50%      { opacity: 1;   transform: rotate(90deg) translateY(2px); }
        }
        @keyframes breathe-right {
          0%, 100% { opacity: 0.3; transform: rotate(-90deg) translateY(-4px); }
          50%      { opacity: 1;   transform: rotate(-90deg) translateY(2px); }
        }

        .dir-down .chevron-v  { animation: breathe-down 2s ease-in-out infinite; }
        .dir-up .chevron-v    { animation: breathe-up 2s ease-in-out infinite; }
        .dir-left .chevron-v  { animation: breathe-left 2s ease-in-out infinite; }
        .dir-right .chevron-v { animation: breathe-right 2s ease-in-out infinite; }

        .chevron-v {
          color: var(--color-brand-yellow);
        }

        .dir-down .chevron-v:not(:first-child),
        .dir-up .chevron-v:not(:first-child) {
          margin-top: -10px;
        }
        .dir-left .chevron-v:not(:first-child),
        .dir-right .chevron-v:not(:first-child) {
          margin-left: -10px;
        }

        .wave-normal .v-1 { animation-delay: 0s; }
        .wave-normal .v-2 { animation-delay: 0.3s; }
        .wave-normal .v-3 { animation-delay: 0.6s; }

        .wave-reverse .v-1 { animation-delay: 0.6s; }
        .wave-reverse .v-2 { animation-delay: 0.3s; }
        .wave-reverse .v-3 { animation-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .animated-text,
          .dir-down .chevron-v,
          .dir-up .chevron-v,
          .dir-left .chevron-v,
          .dir-right .chevron-v {
            animation: none !important;
            opacity: 1 !important;
          }
          
          .animated-text { transform: translateY(0) !important; }
          .dir-down .chevron-v { transform: rotate(0deg) translateY(0) !important; }
          .dir-up .chevron-v   { transform: rotate(180deg) translateY(0) !important; }
          .dir-left .chevron-v { transform: rotate(90deg) translateY(0) !important; }
          .dir-right .chevron-v{ transform: rotate(-90deg) translateY(0) !important; }
        }
      `}</style>

      {/* Tekst informacyjny */}
      {text && (
        /* POPRAWKA: Przejście z surowych klas rozmiaru czcionki na token !text-btn-mono */
        <span className="animated-text shadow-brand !text-btn-mono font-medium uppercase tracking-wider">
          {text}
        </span>
      )}

      {/* Kontener strzałek */}
      <div className={`flex items-center justify-center shadow-brand ${currentConfig.container} ${currentConfig.typeClass}`}>
        <svg className="chevron-v v-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        <svg className="chevron-v v-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        <svg className="chevron-v v-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}