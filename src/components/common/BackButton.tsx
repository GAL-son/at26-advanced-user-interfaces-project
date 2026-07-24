"use client";

import React, { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { focusFlatSection } from "@/app/_utils/navigation"; // Importujesz utility bezpośrednio tutaj

interface BackButtonProps {
  fallbackHref?: string;
  ariaLabel?: string;
  tabIndex?: number;
  "data-focus-order"?: string;
  sectionName?: string;
  sectionOrder?: string[];
}

const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(function BackButton(
  { fallbackHref, ariaLabel, tabIndex, "data-focus-order": dataFocusOrder, sectionName, sectionOrder },
  ref
) {
  const router = useRouter();
  const t = useTranslations("Common");

  const handleBack = () => {
    if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  // Logika klawiatury przeniesiona do środka
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!sectionName || !sectionOrder) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusFlatSection(sectionName, "next", sectionOrder);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusFlatSection(sectionName, "prev", sectionOrder);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleBack}
      onKeyDown={handleKeyDown} // Reaguje na klawisze wewnątrz komponentu
      aria-label={ariaLabel || t("back")}
      tabIndex={tabIndex ?? 0}
      data-focus-order={dataFocusOrder}
      className={`
        focus-brand
        inline-flex items-center justify-center p-2 rounded-full cursor-pointer
        border border-[var(--color-brand-navy-light)]
        text-[var(--color-brand-text-muted)] bg-transparent
        transition-all duration-200
        hover:bg-[color-mix(in_srgb,var(--color-brand-navy-light)_30%,transparent)]
        hover:border-[var(--color-brand-text-muted)]
        hover:text-[var(--color-brand-text)]
      `.trim()}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
});

export default BackButton;