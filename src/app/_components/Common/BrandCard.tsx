"use client";

import React from "react";

type CardElements = "div" | "article" | "li" | "section";
interface BrandCardOwnProps {
  children: React.ReactNode;
  as?: CardElements;
  interactive?: boolean;
}

type BrandCardProps<T extends CardElements> = BrandCardOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof BrandCardOwnProps>;

export default function BrandCard<T extends CardElements = "div">({
  children,
  as,
  interactive = true,
  className = "",
  ...props
}: BrandCardProps<T>) {
  const Component = (as || "div") as React.ElementType;

  return (
    <Component
      tabIndex={interactive ? 0 : undefined}
      className={`
        h-full w-full p-6 
        rounded-[var(--radius-brand-card)] 
        border border-[var(--color-brand-navy-light)] 
        bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_40%,transparent)]
        shadow-xs backdrop-blur-xs
        focus-brand
        ${
          interactive
            ? "cursor-pointer hover:border-[var(--color-brand-yellow-hover)] hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            : ""
        }
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}