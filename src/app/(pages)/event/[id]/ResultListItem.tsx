"use client";
import React from 'react';
import { TableRow, TableCell, Box, Tooltip } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // 🟢 Ikonka ognia dla combo
import { RaceResultExtended } from '../page';

interface ResultListItemProps {
  row: RaceResultExtended;
}

export default function ResultListItem({ row }: ResultListItemProps) {
  const formatTime = (ms: number) => {
    if (ms === 0 || !ms) return "-";
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(3);
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
  };

  const isGain = row.eloChange >= 0;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700 }}>{row.pos}</TableCell>
      <TableCell sx={{ fontWeight: 500 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{row.name}</span>
          {/* 🟢 Jeśli gracz miał combo w tym wyścigu, pokazujemy płomień przy nicku */}
          {row.combo > 0 && (
            <Tooltip title={`Aktywne combo wyścigów: x${row.combo} (+${row.combo * 10}% do zysków ELO)`} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'orange', fontSize: '0.85rem', fontWeight: 700 }}>
                <LocalFireDepartmentIcon fontSize="small" sx={{ color: '#ff6d00' }} />
                <span>{row.combo}</span>
              </Box>
            </Tooltip>
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          fontWeight: 600,
          fontFamily: 'monospace',
          fontSize: '0.95rem'
        }}>
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {row.eloBefore}
          </Box>
          
          <ArrowRightAltIcon sx={{ color: 'text.disabled', fontSize: '1.2rem' }} />
          
          <Box component="span" sx={{ color: 'text.primary' }}>
            {row.eloAfter}
          </Box>
          
          <Box 
            component="span" 
            sx={{ 
              color: isGain ? 'success.main' : 'error.main',
              fontSize: '0.85rem',
              fontWeight: 700,
              ml: 0.5
            }}
          >
            ({isGain ? `+${row.eloChange}` : row.eloChange})
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        {row.car}
      </TableCell>
      <TableCell>{row.laps}</TableCell>
      <TableCell>{formatTime(row.totalTime)}</TableCell>
      <TableCell>{row.gap}</TableCell>
    </TableRow>
  );
}