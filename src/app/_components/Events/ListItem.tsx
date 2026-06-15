"use client";
import React from 'react';
import { Box, BoxProps } from '@mui/material';

// 1. Definiujemy propsy, rozszerzając standardowe BoxProps z MUI.
// Używamy omit, jeśli chcemy jawnie nadpisać lub zignorować pewne typy, 
// ale dla czystości kodu po prostu dodajemy opcjonalne "śmieciowe" propsy do odfiltrowania.
interface ListItemProps extends BoxProps<'li'> {
  children: React.ReactNode;
  primaryTypographyProps?: unknown;
  secondaryTypographyProps?: unknown;
}

// 2. Używamy React.forwardRef, aby ref poprawnie trafiał do elementu HTMLLIElement (obsługiwanego przez Box)
const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      children,
      className = '',
      primaryTypographyProps,   // Wyciągamy i ignorujemy
      secondaryTypographyProps, // Wyciągamy i ignorujemy
      ...rest                   // Reszta bezpiecznych propsów (onClick, onKeyDown, ref itd.)
    },
    ref
  ) => {
    return (
      <Box
        component="li"
        ref={ref} // 3. Przekazujemy ref bezpośrednio do Box
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
        className={`bg-[var(--color-brand-navy-dark)] ${className}`}
        {...rest} // 4. Bezpiecznie przekazujemy resztę propsów, w tym onKeyDown / onKeyPress
      >
        {children}
      </Box>
    );
  }
);

// Dobra praktyka przy forwardRef dla łatwiejszego debugowania w React DevTools
ListItem.displayName = 'ListItem';

export default ListItem;