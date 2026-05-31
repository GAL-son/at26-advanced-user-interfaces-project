"use client";
import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface EventRowSkeletonProps {
  count?: number;
}

export default function EventRowSkeleton({ count = 3 }: EventRowSkeletonProps) {
  return (
    <Box component="div" aria-hidden="true">
      {[...Array(count)].map((_, index) => (
        <Paper
          key={`list-skeleton-${index}`}
          elevation={0} // Identycznie jak w EventRow
          sx={{
            p: 1.5,
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'background.paper', // Wymuszenie identycznego koloru tła co EventRow
          }}
        >
          {/* Lewa strona: Atrapa toru i czasu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
            {/* Atrapa nazwy toru (wysokość dopasowana do wariantu body1/h2) */}
            <Skeleton variant="text" width="40%" height={24} animation="wave" />
            {/* Atrapa daty (wysokość dopasowana do wariantu body2) */}
            <Skeleton variant="text" width="20%" height={20} animation="wave" />
          </Box>
          
          {/* Prawa strona: Atrapa pigułki serwera */}
          <Box sx={{ flexShrink: 0 }}>
            {/* Używamy variant="rounded", aby naśladować lekko zaokrąglony boks serwera */}
            <Skeleton variant="rounded" width={120} height={24} animation="wave" sx={{ borderRadius: 1 }} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}