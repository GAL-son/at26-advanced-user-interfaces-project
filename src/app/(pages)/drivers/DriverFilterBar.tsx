"use client";
import React from "react";
import { Tabs, Tab, TextField, Box } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export type SortOption = "elo" | "races" | "name" | "lastRaced";

interface DriverFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
}

export default function DriverFilterBar({
  search,
  setSearch,
  sortBy,
  setSortBy,
}: DriverFilterBarProps) {
  return (
    // GLÓWNY KONTENER FILTRÓW - zunifikowane zaokrąglenie v4
    <Box className="flex flex-col lg:flex-row gap-4 mb-6 bg-brand-navy-dark p-4 rounded-brand-card border border-brand-navy-light items-stretch lg:items-center shadow-sm">
      {/* 4 TABSY SORTOWANIA */}
      <Box className="flex-grow overflow-x-auto">
        <Tabs
          value={sortBy}
          onChange={(_, newValue: SortOption) => setSortBy(newValue)}
          aria-label="Leaderboard sorting categories"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "46px",
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-brand-yellow)",
            },
            "& .MuiTabs-flexContainer": { gap: "4px" },
            "& .MuiTab-root": {
              color: "var(--color-brand-muted)",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              tracking: "wider",
              minHeight: "40px",
              py: 1,
              px: 2,
              borderRadius: "8px", // Mniejsze, wewnętrzne zaokrąglenie przycisków dla lepszego efektu "pigułki"
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--color-brand-muted)",
              },
            },
            "& .Mui-selected": {
              color: "var(--color-brand-yellow) !important",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
          className="bg-brand-navy/40 p-1 rounded-brand-card border border-brand-navy-light/60"
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

      {/* WYSZUKIWARKA */}
      <Box className="w-full lg:w-80 flex-shrink-0">
        <TextField
          fullWidth
          label="Search driver or alias..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-brand-card overflow-hidden"
          // 🟢 IDEALNE DOPASOWANIE POD MUI v9:
          slotProps={{
            label: {
              className: "!text-brand-muted focus:!text-brand-yellow",
            },
            input: {
              className: "bg-brand-navy/40 py-2.5",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "48px",
              borderRadius: "var(--radius-brand-card)",
              color: "var(--color-brand-muted) !important",
              "& fieldset": { borderColor: "var(--color-brand-navy-light)" },
              "&:hover fieldset": { borderColor: "var(--color-brand-muted)" },
              "&.Mui-focused fieldset": {
                borderColor: "var(--color-brand-yellow)",
              },
            },
            "& .MuiInputBase-input": {
              color: "var(--color-brand-muted) !important",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "var(--color-brand-muted) !important",
              opacity: "0.7 !important", // Rozwiązanie problemu ciemnego placeholdera
            },
          }}
        />
      </Box>
    </Box>
  );
}
