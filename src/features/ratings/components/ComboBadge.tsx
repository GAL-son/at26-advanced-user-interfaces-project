"use client";

import { Flame, ShieldAlert } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

import { RATING_CONFIG } from '@/lib/config/rating.config';

interface ComboBadgeProps {
  combo?: number;
  erosion?: number;
}

export default function ComboBadge({ combo = 0, erosion = 0 }: ComboBadgeProps) {
  const t = useTranslations("Elo");
  const format = useFormatter();

  if (combo <= 0 && erosion <= 0) return null;

  const isCombo = combo > 0;
  const value = isCombo ? combo : erosion;
  const formattedValue = format.number(value);

  let fullDescription = "";
  let badgeStyles = "";
  let Icon = Flame;

  if (isCombo) {
    const bonusMultiplier = combo * 10;
    const formattedMultiplier = format.number(bonusMultiplier);
    fullDescription = t("comboTooltip", { 
      streak: formattedValue, 
      multiplier: formattedMultiplier 
    });
    badgeStyles = "bg-[var(--color-streak-bg)] text-[var(--color-streak-text)] border-[var(--color-streak-border)]";
    Icon = Flame;
  } else {
    fullDescription = t("erosionTooltip", { 
      value: formattedValue 
    });
    Icon = ShieldAlert;

    if (erosion === RATING_CONFIG.erosionStart) {
      badgeStyles = "bg-[var(--color-erosion-start-bg)] text-[var(--color-erosion-start-text)] border-[var(--color-erosion-start-border)] animate-pulse";
    } else {
      badgeStyles = "bg-[var(--color-erosion-bg)] text-[var(--color-erosion-text)] border-[var(--color-erosion-border)]";
    }
  }

  return (
    <div className="relative group inline-flex items-center">
      <span 
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-btn-mono font-bold transition-colors ${badgeStyles}`}
      >
        <Icon aria-hidden="true" className="w-3.5 h-3.5" />
        <span aria-hidden="true">{formattedValue}</span>
        <span className="sr-only">{fullDescription}</span>
      </span>

      <div 
        role="tooltip"
        aria-hidden="true"
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          hidden group-hover:block z-50 whitespace-nowrap
          px-2.5 py-1 text-xs font-sans rounded shadow-lg
          bg-[var(--color-brand-navy-dark)] text-[var(--color-brand-text)]
          border border-[var(--color-brand-navy-light)]
        "
      >
        {fullDescription}
      </div>
    </div>
  );
}