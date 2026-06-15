"use client";
import React from 'react';
import { Box, Tooltip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslations, useFormatter } from 'next-intl';

interface ComboBadgeProps {
  combo: number;
}

export default function ComboBadge({ combo }: ComboBadgeProps) {
  // Zmiana namespace na "Elo"
  const t = useTranslations("Elo");
  const format = useFormatter();

  if (combo <= 0) return null;

  // Obliczamy mnożnik dynamicznie (np. combo 3 = 30%)
  const bonusMultiplier = combo * 10;

  const formattedStreak = format.number(combo);
  const formattedMultiplier = format.number(bonusMultiplier);

  // Aktualizacja klucza na bezpośredni w nowym namespace
  const fullDescription = t("comboTooltip", { 
    streak: formattedStreak, 
    multiplier: formattedMultiplier 
  });

  return (
    <Tooltip 
      title={fullDescription} 
      arrow
      slotProps={{
        tooltip: {
          "aria-hidden": true
        }
      }}
    >
      <Box 
        component="span" 
        className="flex items-center bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 text-xs font-bold"
      >
        <LocalFireDepartmentIcon aria-hidden="true" sx={{ fontSize: '0.95rem', mr: 0.2 }} />
        
        <span aria-hidden="true">{formattedStreak}</span>

        <span className="sr-only">
          {fullDescription}
        </span>
      </Box>
    </Tooltip>
  );
}