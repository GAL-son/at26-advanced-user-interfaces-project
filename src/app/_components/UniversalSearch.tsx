"use client";

import React, { useState, useEffect, useRef, ComponentType } from "react";
import { Box, TextField, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchResultItem {
  guid: string;
  mainName: string;
  [key: string]: any; // Pozwala na przekazywanie dowolnych dodatkowych danych do customowych wierszy
}

interface UniversalSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
  results?: SearchResultItem[];
  onSelectResult?: (item: SearchResultItem) => void;
  fullWidth?: boolean;
  // 🎯 NOWY PROP: Komponent, który ma wyrenderować wnętrze wiersza
  renderItem?: ComponentType<{ item: SearchResultItem }>;
}

export default function UniversalSearch({
  value,
  onChange,
  placeholder = "Search...",
  label,
  isLoading = false,
  results,
  onSelectResult,
  fullWidth = true,
  renderItem: RenderItem, // Mapujemy na Wielką Literę, aby React traktował to jako komponent
}: UniversalSearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasDropdown = Array.isArray(results);

  useEffect(() => {
    if (!hasDropdown) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hasDropdown]);

  const handleItemClick = (item: SearchResultItem) => {
    if (onSelectResult) {
      onSelectResult(item);
    }
    setIsDropdownOpen(false);
  };

  return (
    <Box ref={dropdownRef} className="relative w-full">
      <TextField
        fullWidth={fullWidth}
        label={label}
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsDropdownOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsDropdownOpen(true);
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "var(--color-brand-text-muted)" }} />
              </InputAdornment>
            ),
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} sx={{ color: "var(--color-brand-yellow-hover)" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "48px",
            borderRadius: "var(--radius-brand-card)",
            color: "var(--color-brand-text)",
            backgroundColor: "var(--color-brand-navy-dark)",
            transition: "all 0.3s ease",
            "& fieldset": { borderColor: "var(--color-brand-navy-light)" },
            "&:hover fieldset": { borderColor: "var(--color-brand-text-muted)" },
            "&.Mui-focused fieldset": { borderColor: "var(--color-brand-yellow-hover)" },
          },
          "& .MuiInputLabel-root": {
            color: "var(--color-brand-text-muted)",
            "&.Mui-focused": { color: "var(--color-brand-yellow-text)" }
          },
          "& .MuiInputBase-input": {
            color: "var(--color-brand-text)",
            "&::placeholder": { color: "var(--color-brand-text-muted)", opacity: 0.7 }
          },
        }}
      />

      {/* ROZWIJANA LISTA WYNIKÓW */}
      {hasDropdown && isDropdownOpen && (value.trim().length > 0 || results.length > 0) && (
        <Box 
          className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto font-mono text-sm shadow-xl"
          sx={{
            backgroundColor: "color-mix(in srgb, var(--color-brand-navy-dark) 95%, transparent)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--color-brand-navy-light)",
            borderRadius: "var(--radius-brand-card)",
          }}
        >
          {results.length === 0 && !isLoading ? (
            <Box className="p-4 text-center text-xs" sx={{ color: "var(--color-brand-text-muted)", opacity: 0.6 }}>
              [NO TELEMETRY FOUND]
            </Box>
          ) : (
            results.map((item) => (
              <Box
                key={item.guid}
                onClick={() => handleItemClick(item)}
                className="p-3 cursor-pointer flex justify-between items-center transition-colors"
                sx={{
                  borderBottom: "1px solid var(--color-brand-navy-light)",
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": {
                    backgroundColor: "color-mix(in srgb, var(--color-brand-text) 6%, transparent)",
                  },
                }}
              >
                {/* 🎯 LOGIKA DYNAMICZNEGO RENDEROWANIA */}
                {RenderItem ? (
                  <RenderItem item={item} />
                ) : (
                  <span style={{ color: "var(--color-brand-text)" }}>{item.mainName}</span>
                )}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}