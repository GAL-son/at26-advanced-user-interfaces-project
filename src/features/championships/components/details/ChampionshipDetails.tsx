"use client"

import HeroCard from "@/components/common/HeroCard";

export interface ChampionshipDetailsProps {
    name: string
}

export default function ChampionshipDetails({ name }: ChampionshipDetailsProps) {
    return (
        <HeroCard data-section="championship-hero">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--color-brand-yellow)] text-[var(--color-brand-navy)] rounded-xs">
                Championship
            </span>
            <h1 className="text-page-title text-4xl sm:text-5xl md:text-6xl leading-tight">
                {name}
            </h1>
        </HeroCard>
    );
}