"use client";

import React, { forwardRef } from "react";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface BackButtonProps {
  /** Opcjonalna ścieżka docelowa. Jeśli nie zostanie podana, komponent cofnie użytkownika w historii przeglądarki */
  fallbackHref?: string;
  /** Niestandardowa etykieta aria-label. Jeśli nie zostanie podana, użyje domyślnego klucza z sekcji Common */
  ariaLabel?: string;
  /** Przekazywane przez strukturę strony do kontrolowania kolejności tabowania (WCAG) */
  tabIndex?: number;
  /** Atrybut priorytetu dla skryptu nawigacji klawiaturą */
  "data-focus-order"?: string;
  /** Callback do obsługi nawigacji strzałkami */
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(function BackButton(
  { fallbackHref, ariaLabel, tabIndex, "data-focus-order": dataFocusOrder, onKeyDown },
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

  return (
    <IconButton 
      ref={ref}
      onClick={handleBack} 
      onKeyDown={onKeyDown}
      aria-label={ariaLabel || t("back")}
      tabIndex={tabIndex ?? 0}
      data-focus-order={dataFocusOrder}
      /* Klasa focus-brand zarządza bezpiecznym konturem dla WCAG */
      className="focus-brand"
      sx={{
        border: '1px solid var(--color-brand-navy-light)',
        color: 'var(--color-brand-text-muted)',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease',
        
        /* POPRAWKA: Czyszczenie natywnego outline MUI, pozwalając klasie .focus-brand przejąć pełną kontrolę */
        "&:focus-visible": {
          outline: "none",
        },
        
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-navy-light) 30%, transparent)',
          borderColor: 'var(--color-brand-text-muted)',
          color: 'var(--color-brand-text)',
        },
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
});

export default BackButton;