"use client";

import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
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
  return (
    <Box className="flex-grow overflow-x-auto">
      <Tabs
        value={sortBy}
        onChange={(_, newValue: SortOption) => setSortBy(newValue)}
        aria-label="Leaderboard sorting categories"
        variant="scrollable"
        scrollButtons="auto"
        className="p-1"
        sx={{
          backgroundColor: "var(--color-brand-navy)",
          border: "1px solid var(--color-brand-navy-light)",
          borderRadius: "var(--radius-brand-card)",
          minHeight: "46px",

          "& .MuiTabs-indicator": {
            backgroundColor: "var(--color-brand-yellow-hover)",
          },
          "& .MuiTabs-flexContainer": { gap: "4px" },

          /* Domyślny stan zakładek (nieaktywne) */
          "& .MuiTab-root": {
            color: "var(--color-brand-text-muted)",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            minHeight: "40px",
            py: 1,
            px: 2,
            borderRadius: "8px",
            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor:
                "color-mix(in srgb, var(--color-brand-text) 8%, transparent)",
              color: "var(--color-brand-text)",
            },
          },

          /* Aktywna zakładka */
          "& .Mui-selected": {
            color: "var(--color-brand-yellow-text) !important",
            backgroundColor:
              "color-mix(in srgb, var(--color-brand-yellow) 12%, transparent)",
            "& .MuiSvgIcon-root": {
              color: "var(--color-brand-yellow-text)",
            },
          },
        }}
      >
        <Tab
          icon={<EmojiEventsIcon sx={{ fontSize: "1.1rem" }} />}
          iconPosition="start"
          label="Rating"
          value="elo"
        />
        <Tab
          icon={<MilitaryTechIcon sx={{ fontSize: "1.2rem" }} />}
          iconPosition="start"
          label="Experience"
          value="races"
        />
        <Tab
          icon={<SortByAlphaIcon sx={{ fontSize: "1.1rem" }} />}
          iconPosition="start"
          label="A - Z"
          value="name"
        />
        <Tab
          icon={<AccessTimeIcon sx={{ fontSize: "1.1rem" }} />}
          iconPosition="start"
          label="Last Active"
          value="lastRaced"
        />
      </Tabs>
    </Box>
  );
}