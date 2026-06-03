"use client";
import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface EventRowSkeletonProps {
  count?: number;
}

export default function EventRowSkeleton({ count = 3 }: EventRowSkeletonProps) {
  return (
    <Box component="div" aria-hidden="true" className="space-y-3">
      {[...Array(count)].map((_, index) => (
        <Paper
          key={`list-skeleton-${index}`}
          elevation={0}
          sx={{
            p: 2.5, // Identyczny padding (p: 2.5 równa się wewnętrznym odstępom paska z ButtonBase)
            backgroundImage: 'none',
            backgroundColor: 'transparent',
          }}
          className="bg-brand-navy-dark border border-brand-navy-light rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          {/* Lewa strona: Atrapa toru i czasu */}
          <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 flex-grow w-full sm:w-auto">
            {/* Atrapa nazwy toru */}
            <Skeleton 
              variant="text" 
              width="45%" 
              height={28} 
              animation="wave" 
              className="bg-brand-navy-light/40"
            />
            {/* Atrapa daty wyścigu */}
            <Skeleton 
              variant="text" 
              width="25%" 
              height={20} 
              animation="wave" 
              className="bg-brand-navy-light/30"
            />
          </Box>
          
          {/* Prawa strona: Atrapa tagu serwera */}
          <Box className="flex-shrink-0 w-32 sm:w-auto">
            <Skeleton 
              variant="rounded" 
              width={140} 
              height={26} 
              animation="wave" 
              className="bg-brand-navy-light/30 rounded-md" 
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}