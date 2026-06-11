// src/app/_components/ListItem.tsx

"use client";
import React from 'react';
import { Box } from '@mui/material';

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function ListItem({ children, className }: ListItemProps) {
  return (
    <Box 
      component="li" 
      role="listitem"
      sx={{
        p: 0,
        mb: 1.5,
        backgroundImage: 'none',
        backgroundColor: 'transparent',
        border: '1px solid var(--color-brand-navy-light)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: 'var(--color-brand-navy-light) !important',
        },
      }}
      className={`bg-brand-navy-dark ${className || ''}`}
    >
      {children}
    </Box>
  );
}