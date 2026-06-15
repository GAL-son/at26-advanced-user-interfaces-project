"use client";

import React from "react";
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
}

export default function BackButton({ 
  fallbackHref, 
  ariaLabel, 
  tabIndex, 
  "data-focus-order": dataFocusOrder 
}: BackButtonProps) {
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
      onClick={handleBack} 
      aria-label={ariaLabel || t("back")}
      tabIndex={tabIndex}
      data-focus-order={dataFocusOrder}
      // Podpinamy klasę utility focus-brand
      className="focus-brand"
      sx={{
        border: '1px solid var(--color-brand-navy-light)',
        color: 'var(--color-brand-text-muted)',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease',
        
        // Wyczyszczenie domyślnego zachowania focusu pod utility CSS
        "&:focus, &:focus-visible": {
          outline: "none",
        },
        
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 8%, transparent)',
          borderColor: 'var(--color-brand-text-muted)'
        },
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}