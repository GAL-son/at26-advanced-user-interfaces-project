"use client";
import React, { forwardRef } from 'react';
import { motion, Transition, HTMLMotionProps } from 'framer-motion';

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit:   { opacity: 0, x: -20 },
};

interface AnimatedTableRowProps extends HTMLMotionProps<"tr"> {
  transition?: Transition;
}

const AnimatedTableRow = forwardRef<HTMLTableRowElement, AnimatedTableRowProps>(({
  children,
  className = "",
  transition,
  ...props
}, ref) => {
  return (
    <motion.tr
      ref={ref}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      /* USUNIĘTO: layout (to niszczyło układ tabeli) */
      transition={transition ?? { duration: 0.2 }}
      className={`
        table-row group relative outline-none focus-brand focus:z-10 focus-visible:z-10 
        transition-colors duration-150 cursor-pointer
        bg-[var(--color-brand-navy-dark)] 
        border-b border-[var(--color-brand-navy-light)]
        hover:bg-[color-mix(in_srgb,var(--color-brand-text)_4%,var(--color-brand-navy-dark))]
        focus-visible:bg-[color-mix(in_srgb,var(--color-brand-text)_6%,var(--color-brand-navy-dark))]
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </motion.tr>
  );
});

AnimatedTableRow.displayName = "AnimatedTableRow";
export default AnimatedTableRow;