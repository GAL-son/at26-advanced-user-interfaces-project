"use client";
import React from 'react';
import { Box, Tooltip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface ComboBadgeProps {
  combo: number;
}

export default function ComboBadge({ combo }: ComboBadgeProps) {
  if (combo <= 0) return null;

  return (
    <Tooltip 
      title={`Active streak: ${combo} consecutive races. Future ELO gains multiplied by +${combo * 10}%!`} 
      arrow
    >
      <Box 
        component="span" 
        className="flex items-center bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 text-xs font-bold"
      >
        <LocalFireDepartmentIcon sx={{ fontSize: '0.95rem', mr: 0.2 }} />
        <span>{combo}</span>
      </Box>
    </Tooltip>
  );
}