"use client";

import { ClassNames } from "@emotion/react";
import React from "react";
import { defaultCartesianAxisProps } from "recharts/types/cartesian/CartesianAxis";

interface HeroCardProps {
    children?: React.ReactNode,
    className?: string,
    ariaLabel?: string,
}

export default function HeroCard({ children, className, ariaLabel }: HeroCardProps) {
    return (
        <section
            aria-labelledby={ariaLabel}
            className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-[var(--color-brand-navy-dark)] to-[color-mix(in_srgb,var(--color-brand-navy-dark)_80%,black)] border-l-4 border-l-[var(--color-brand-yellow)] border-t border-r border-b border-[var(--color-brand-navy-light)] rounded-r-xl rounded-l-sm shadow-xl"
        >
            <div className={className}>{children}</div>

        </section>
    );
}