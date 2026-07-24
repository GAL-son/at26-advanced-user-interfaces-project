"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import BrandCard from "@/app/_components/Common/BrandCard";
import type { ChampionshipListItemDto } from "@/lib/services/championships.service";

interface ChampionshipCardProps {
  championship: ChampionshipListItemDto;
}

export default function ChampionshipCard({ championship }: ChampionshipCardProps) {
  const t = useTranslations("Events");

  return (
    <BrandCard 
      as="li" 
      className="group relative flex flex-col overflow-hidden"
      id={`championship-card-${championship.id}`}
    >
      <Link 
        href={`/championships/${championship.id}`}
        className="flex h-full flex-col justify-between focus:outline-none"
      >
        <div className="absolute top-0 right-0 h-16 w-16 opacity-10 transition-opacity group-hover:opacity-20">
          <div className="absolute top-[-20px] right-[-20px] h-20 w-20 rotate-45 bg-[var(--color-brand-yellow)]" />
        </div>

        <div>
          <h2 className="text-card-title leading-tight text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-yellow-text)] transition-colors duration-300">
            {championship.name}
          </h2>
          <div className="mt-2 h-1 w-12 bg-[var(--color-brand-navy-light)] transition-all duration-300 group-hover:w-20 group-hover:bg-[var(--color-brand-yellow)]" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-btn-mono uppercase tracking-[0.1em] text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-text)] transition-colors duration-300">
            {t("list.viewChampionship") || "Szczegóły ligi"}
          </span>
          <span className="translate-x-0 text-xl text-[var(--color-brand-yellow)] transition-transform duration-300 group-hover:translate-x-2">
            &rarr;
          </span>
        </div>
      </Link>
    </BrandCard>
  );
}