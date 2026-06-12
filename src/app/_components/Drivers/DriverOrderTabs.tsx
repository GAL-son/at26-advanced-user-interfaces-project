"use client";

import React from "react";
import { Box, ButtonBase } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export type SortOption = "elo" | "races" | "name" | "lastRaced";

interface DriverOrderTabsProps {
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
}

export default function DriverOrderTabs({ sortBy, setSortBy }: DriverOrderTabsProps) {
  
  const tabsConfig = [
    { value: "elo", label: "Rating", icon: <EmojiEventsIcon sx={{ fontSize: "1.1rem" }} /> },
    { value: "races", label: "Experience", icon: <MilitaryTechIcon sx={{ fontSize: "1.2rem" }} /> },
    { value: "name", label: "A - Z", icon: <SortByAlphaIcon sx={{ fontSize: "1.1rem" }} /> },
    { value: "lastRaced", label: "Last Active", icon: <AccessTimeIcon sx={{ fontSize: "1.1rem" }} /> },
  ];

  return (
    <Box 
      className="flex-grow w-full"
      sx={{
        display: "grid",
        // 🔄 KLUCZOWA ZMIANA: xs: 2 kolumny (siatka 2x2), md: 4 kolumny (pasek 1x4)
        gridTemplateColumns: { 
          xs: "repeat(2, 1fr)", 
          md: "repeat(4, 1fr)" 
        },
        gap: "6px",
        p: "4px",
        backgroundColor: "var(--color-brand-navy)",
        border: "1px solid var(--color-brand-navy-light)",
        borderRadius: "var(--radius-brand-card)",
      }}
    >
      {tabsConfig.map((tab) => {
        const isSelected = sortBy === tab.value;

        return (
          <ButtonBase
            key={tab.value}
            onClick={() => setSortBy(tab.value as SortOption)}
            focusRipple
            aria-selected={isSelected}
            role="tab"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              
              fontFamily: "monospace",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              minHeight: "40px",
              py: 1,
              px: 2,
              borderRadius: "8px",
              width: "100%", 
              transition: "all 0.2s ease",

              color: "var(--color-brand-text-muted)",
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
            {tab.icon}
            <span>{tab.label}</span>
          </ButtonBase>
        );
      })}
    </Box>
  );
}