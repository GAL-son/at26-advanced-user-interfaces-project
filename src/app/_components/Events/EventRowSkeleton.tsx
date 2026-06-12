"use client";
import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface EventRowSkeletonProps {
  count?: number;
}

export default function EventRowSkeleton({ count = 3 }: EventRowSkeletonProps) {
  return (
    <Box component="div" aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(count)].map((_, index) => (
        <Paper
          key={`grid-skeleton-${index}`}
          elevation={0}
          sx={{
            p: 3, 
            backgroundImage: 'none',
            
            // Identyczne tło bazowe i obramowanie jak w oryginalnym kafelku (brak efektu skakania layoutu)
            backgroundColor: 'var(--color-brand-navy-dark)',
            border: '1px solid var(--color-brand-navy-light)',
            borderRadius: 'var(--radius-brand-card, 12px)',
            
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 3,
            minHeight: '166px' // Dopasowanie do realnej wysokości wypełnionego kafelka
          }}
        >
          {/* Góra szkieletu */}
          <Box className="flex flex-col gap-2 w-full">
            {/* Atrapa nazwy toru */}
            <Skeleton 
              variant="text" 
              width="75%" 
              height={28} 
              animation="wave" 
              className="bg-brand-navy-light/40"
            />
            {/* Atrapa daty wyścigu */}
            <Skeleton 
              variant="text" 
              width="45%" 
              height={18} 
              animation="wave" 
              className="bg-brand-navy-light/30"
            />
          </Box>
          
          {/* Dół szkieletu */}
          <Box className="w-full pt-2 border-t border-brand-navy-light/20">
            <Skeleton 
              variant="rounded" 
              width={130} 
              height={24} 
              animation="wave" 
              className="bg-brand-navy-light/30 rounded-md" 
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}