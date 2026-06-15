"use client";
import React from 'react';
import { Link } from '@/i18n/routing';

// 1. Definiujemy typ: dziedziczymy wszystko z Linku (w tym poprawny typ dla href)
interface ListItemProps extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ children, className = '', href, ...rest }, ref) => {
    return (
      <Link
        ref={ref}
        href={href} /* 2. Jawnie przekazujemy href */
        {...rest}   /* 3. W ...rest nie ma już href, więc nic go nie nadpisze */
        className={`
          cursor-pointer group relative flex flex-col
          bg-[var(--color-brand-navy-dark)] 
          border border-[var(--color-brand-navy-light)]/60 
          rounded-xl
          transition-all duration-300 
          
          /* Hover */
          hover:border-[var(--color-brand-yellow-hover)] 
          hover:bg-[var(--color-brand-navy-light)]/30 
          
          /* Focus */
          focus-brand
          
          ${className}
        `}
        style={{ textDecoration: 'none' }}
      >
        {children}
      </Link>
    );
  }
);

ListItem.displayName = 'ListItem';
export default ListItem;