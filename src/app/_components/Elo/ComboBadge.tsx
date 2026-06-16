"use client";

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslations, useFormatter } from 'next-intl';

interface ComboBadgeProps {
  combo: number;
}

export default function ComboBadge({ combo }: ComboBadgeProps) {
  const t = useTranslations("Elo");
  const format = useFormatter();

  if (combo <= 0) return null;

  const bonusMultiplier = combo * 10;

  const formattedStreak = format.number(combo);
  const formattedMultiplier = format.number(bonusMultiplier);

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
        /* POPRAWKA: Dodano klasę gap i podmieniono text-xs font-bold na zunifikowany token !text-btn-mono */
        className="flex items-center gap-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 !text-btn-mono font-bold"
      >
        {/* POPRAWKA: Usunięcie sx mr na rzecz natywnego gap z flexboxa */}
        <LocalFireDepartmentIcon aria-hidden="true" sx={{ fontSize: '0.95rem' }} />
        
        <span aria-hidden="true">{formattedStreak}</span>

        <span className="sr-only">
          {fullDescription}
        </span>
      </Box>
    </Tooltip>
  );
}