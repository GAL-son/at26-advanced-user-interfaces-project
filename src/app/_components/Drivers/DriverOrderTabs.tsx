"use client";

import React from "react";
import { Box, ButtonBase } from "@mui/material";
import { useTranslations } from "next-intl";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

export type SortOption = "elo" | "races" | "name" | "lastRaced";

interface DriverOrderTabsProps {
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  ariaLabel?: string;
  onNavigateVertical: (direction: "up" | "down") => void;
}

export default function DriverOrderTabs({ 
  sortBy, 
  setSortBy, 
  ariaLabel,
  onNavigateVertical 
}: DriverOrderTabsProps) {
  const t = useTranslations("Drivers");
  
  const tabsConfig: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "elo", label: t("tabs.rating"), icon: <EmojiEventsIcon sx={{ fontSize: "1.1rem" }} /> },
    { value: "races", label: t("tabs.experience"), icon: <MilitaryTechIcon sx={{ fontSize: "1.2rem" }} /> },
    { value: "name", label: t("tabs.alphabetical"), icon: <SortByAlphaIcon sx={{ fontSize: "1.1rem" }} /> },
    { value: "lastRaced", label: t("tabs.lastActive"), icon: <AccessTimeIcon sx={{ fontSize: "1.1rem" }} /> },
  ];

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: tabsConfig.length,
    orientation: "horizontal",
    loop: false,
    onLeave: (direction) => {
      if (direction === "next") {
        const searchInput = document.getElementById("driver-search-container")?.querySelector("input");
        searchInput?.focus();
      }
    }
  });

  const handleCombinedKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    const isBelowLg = window.matchMedia("(max-width: 1199px)").matches;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isBelowLg) {
        const searchInput = document.getElementById("driver-search-container")?.querySelector("input");
        searchInput?.focus();
      } else {
        onNavigateVertical("down");
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigateVertical("up");
      return;
    }

    handleKeyDown(e, index);
  };

  return (
    <Box 
      className="flex-grow w-full"
      role="tablist" 
      aria-label={ariaLabel}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: "6px",
        p: "4px",
        backgroundColor: "var(--color-brand-navy)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
      }}
    >
      {tabsConfig.map((tab, index) => {
        const isSelected = sortBy === tab.value;

        return (
          <ButtonBase
            key={tab.value}
            id={`tab-driver-sort-${tab.value}`} 
            ref={registerItem(index)}
            onClick={() => setSortBy(tab.value)}
            onKeyDown={(e) => handleCombinedKeyDown(e, index)}
            focusRipple
            aria-selected={isSelected}
            role="tab"
            tabIndex={isSelected ? 0 : -1} 
            /* POPRAWKA:
              - Wstrzyknięcie !text-btn-mono, który wymusza Share Tech Mono oraz rozmiar 0.8rem z globals.css
              - Dodanie uppercase oraz font-bold bezpośrednio z klas użytkowych
              - Podpięcie focus-brand
            */
            className="group focus-brand !text-btn-mono uppercase font-bold tracking-wider"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              minHeight: "40px",
              py: 1,
              px: 2,
              borderRadius: "8px",
              width: "100%", 
              transition: "all 0.2s ease",
              color: "var(--color-brand-text-muted)",

              "&:focus, &:focus-visible": {
                outline: "none",
              },

              "& .MuiSvgIcon-root": {
                color: "var(--color-brand-text-muted)",
                transition: "color 0.2s ease",
              },
              ...(isSelected && {
                color: "var(--color-brand-yellow-text) !important",
                backgroundColor: "color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)",
                "& .MuiSvgIcon-root": {
                  color: "var(--color-brand-yellow-text) !important",
                },
              }),
              "&:hover": {
                backgroundColor: isSelected 
                  ? "color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)"
                  : "color-mix(in srgb, var(--color-brand-text) 8%, transparent)",
                color: isSelected ? "var(--color-brand-yellow-text)" : "var(--color-brand-text)",
                "& .MuiSvgIcon-root": {
                  color: isSelected ? "var(--color-brand-yellow-text)" : "var(--color-brand-text)",
                }
              },
            }}
          >
            <span aria-hidden="true" className="flex items-center">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </ButtonBase>
        );
      })}
    </Box>
  );
}