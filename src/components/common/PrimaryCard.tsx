"use client";

import { ClassNames } from "@emotion/react";
import React from "react";
import { defaultCartesianAxisProps } from "recharts/types/cartesian/CartesianAxis";

interface PrimaryCardProps {
    children?: React.ReactNode,
    className?: string
}

export default function PrimaryCard({ children, className }: PrimaryCardProps) {
    return (
        <section
            aria-labelledby="event-title"
            className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-[var(--color-brand-navy-dark)] to-[color-mix(in_srgb,var(--color-brand-navy-dark)_80%,black)] border-l-4 border-l-[var(--color-brand-yellow)] border-t border-r border-b border-[var(--color-brand-navy-light)] rounded-r-xl rounded-l-sm shadow-xl"
        >
            <div className={className}>{children}</div>

        </section>
    );
}