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
}

export default function BackButton({ fallbackHref, ariaLabel }: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations("Common"); // Zmiana na wspólny namespace dla powtarzalnych elementów

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
      // Jeśli rodzic przekaże gotowy ariaLabel, używamy go. W przeciwnym razie bierzemy domyślny z "Common"
      aria-label={ariaLabel || t("back")}
      sx={{
        border: '1px solid var(--color-brand-navy-light)',
        color: 'var(--color-brand-text-muted)',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-brand-text) 8%, transparent)',
          borderColor: 'var(--color-brand-text-muted)'
        },
        '&:focus-visible': {
          outline: '2px solid var(--color-brand-yellow-hover)',
          outlineOffset: '2px',
        }
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}