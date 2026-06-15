"use client";
import React from 'react';
import { Box } from '@mui/material';

// Rozszerzamy interfejs o standardowe atrybuty elementu <li>,
// ale dodajemy też opcjonalne propsy z MUI, które mogą "przypadkiem" spływać z EventRow,
// dzięki czemu będziemy mogli je odizolować.
interface ListItemProps extends React.ComponentPropsWithoutRef<typeof Box> {
  children: React.ReactNode;
  className?: string;
  primaryTypographyProps?: any;
  secondaryTypographyProps?: any;
}

export default function ListItem({ 
  children, 
  className, 
  primaryTypographyProps,   // Wyciągamy i ignorujemy
  secondaryTypographyProps, // Wyciągamy i ignorujemy
  ...rest                   // Reszta bezpiecznych propsów (np. onClick, id)
}: ListItemProps) {
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
      className={`bg-[var(--color-brand-navy-dark)] ${className || ''}`}
      {...rest} // Przekazujemy tylko bezpieczne atrybuty
    >
      {children}
    </Box>
  );
}