"use client";

import React from "react";

interface DynamicGridProps {
  children: React.ReactNode[];
  className?: string;
}

export default function DynamicGrid({
  children,
  className = "",
}: DynamicGridProps) {
  const count = children.length;

  let gridColsClass = "md:grid-cols-3";

  if (count === 1) {
    gridColsClass = "md:grid-cols-1 max-w-2xl mx-auto";
  } else if (count === 2) {
    gridColsClass = "md:grid-cols-2 max-w-4xl mx-auto";
  } else if (count === 3 || count === 4) {
    gridColsClass = "md:grid-cols-3";
  } else if (count === 6) {
    gridColsClass = "md:grid-cols-3";
  }

  return (
    <ul 
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${gridColsClass} ${className}`}
    >
      {children.map((child, index) => (
        <li key={index} className="h-full">
          {child}
        </li>
      ))}
    </ul>
  );
}