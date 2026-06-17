"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Box, TextField, InputAdornment, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchResultItem {
  guid: string;
  mainName: string;
  [key: string]: any;
}

interface UniversalSearchProps<T extends SearchResultItem> 
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "results" | "onChange"> {
    results: T[];
    renderItem?: React.ComponentType<{ item: T }>;
    onSelectResult: (item: T) => void;
    value: string;
    onChange: (val: string) => void; // Teraz Twój niestandardowy typ jest w pełni legalny
    placeholder?: string;
    label?: string;
    isLoading?: boolean;
    fullWidth?: boolean;
}

export default function UniversalSearch<T extends SearchResultItem>({
  value,
  onChange,
  placeholder,
  label,
  isLoading = false,
  results,
  onSelectResult,
  fullWidth = true,
  renderItem: RenderItem,
  onKeyDown,
  ...props
}: UniversalSearchProps<T>) {
  const t = useTranslations("Common");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasDropdown = Array.isArray(results);

  const uniqueId = React.useId();
  const listboxId = `combobox-listbox-${uniqueId}`;
  const getOptionId = (index: number) => `combobox-option-${uniqueId}-${index}`;

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

  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  useEffect(() => {
    if (focusedIndex >= 0) {
      const activeOption = document.getElementById(getOptionId(focusedIndex));
      if (activeOption) {
        activeOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  const handleItemClick = (item: T) => {
    if (onSelectResult) {
      onSelectResult(item);
    }
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const showDropdown = hasDropdown && isDropdownOpen && results.length > 0;

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight") {
        if (onKeyDown) {
          onKeyDown(e);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleItemClick(results[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.focus();
        break;
      case "Tab":
        setIsDropdownOpen(false);
        break;
      default:
        if (onKeyDown) {
          onKeyDown(e);
        }
        break;
    }
  };

  return (
    <Box ref={dropdownRef} className="relative w-full">
      <TextField
        fullWidth={fullWidth}
        label={label}
        variant="outlined"
        placeholder={placeholder || t("searchPlaceholder")}
        value={value}
        onFocus={() => setIsDropdownOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsDropdownOpen(true);
        }}
        onKeyDown={handleKeyDownInternal}
        inputRef={inputRef}
        slotProps={{
          htmlInput: {
            "role": "combobox",
            "aria-expanded": showDropdown,
            "aria-haspopup": "listbox",
            "aria-controls": showDropdown ? listboxId : undefined,
            "aria-autocomplete": "list",
            "aria-activedescendant": focusedIndex >= 0 ? getOptionId(focusedIndex) : undefined,
            ...props,
          },
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
        /* POPRAWKA: Dodanie !font-sans do klas TextField oraz inputu, aby wymusić Rajdhani */
        className="!font-sans"
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
            fontFamily: "var(--font-sans) !important", /* Wymuszenie w MUI */
            "&.Mui-focused": { color: "var(--color-brand-yellow-text)" }
          },
          "& .MuiInputBase-input": {
            color: "var(--color-brand-text)",
            fontFamily: "var(--font-sans) !important", /* Wymuszenie w MUI dla wpisywanego tekstu */
            "&::placeholder": { color: "var(--color-brand-text-muted)", opacity: 0.7 }
          },
        }}
      />

      {/* ROZWIJANA LISTA WYNIKÓW */}
      {showDropdown && (
        <Box
          id={listboxId}
          role="listbox"
          aria-label={label || "Search results"}
          /* POPRAWKA: Zamiana font-mono na ujednolicony token !text-btn-mono z Share Tech Mono */
          className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto !text-btn-mono shadow-xl"
          sx={{
            backgroundColor: "color-mix(in srgb, var(--color-brand-navy-dark) 95%, transparent)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--color-brand-navy-light)",
            borderRadius: "var(--radius-brand-card)",
          }}
        >
          {results.length === 0 && !isLoading ? (
            <Box className="p-4 text-center text-xs !text-btn-mono" sx={{ color: "var(--color-brand-text-muted)", opacity: 0.6 }}>
              {t("noResults")}
            </Box>
          ) : (
            results.map((item, index) => {
              const isKeyboardFocused = index === focusedIndex;
              return (
                <Box
                  key={item.guid}
                  id={getOptionId(index)}
                  role="option"
                  aria-selected={isKeyboardFocused}
                  onClick={() => handleItemClick(item)}
                  className="p-3 cursor-pointer flex justify-between items-center transition-colors"
                  sx={{
                    borderBottom: "1px solid var(--color-brand-navy-light)",
                    "&:last-child": { borderBottom: "none" },
                    backgroundColor: isKeyboardFocused 
                      ? "color-mix(in srgb, var(--color-brand-text) 10%, transparent) !important" 
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "color-mix(in srgb, var(--color-brand-text) 6%, transparent)",
                    },
                  }}
                >
                  {RenderItem ? (
                    <RenderItem item={item} />
                  ) : (
                    /* POPRAWKA: Wymuszenie prawidłowej czcionki monotypowej dla tekstu domyślnego */
                    <Box component="span" className="!text-btn-mono" sx={{ color: "var(--color-brand-text)" }}>
                      {item.mainName}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
}