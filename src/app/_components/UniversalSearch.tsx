"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2 } from "lucide-react";

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
    onChange: (val: string) => void;
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
    <div ref={dropdownRef} className={`relative ${fullWidth ? "w-full" : "w-auto"}`}>
      {/* Etykieta (Label) jeśli podano w propsach */}
      {label && (
        <label 
          htmlFor={uniqueId} 
          className="block mb-1.5 text-xs uppercase font-bold tracking-wider font-sans text-[var(--color-brand-text-muted)]"
        >
          {label}
        </label>
      )}

      {/* Kontener pola tekstowego */}
      <div className="relative flex items-center w-full">
        {/* Ikona wyszukiwania z lewej */}
        <div className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-[var(--color-brand-text-muted)]">
          <Search className="w-5 h-5" />
        </div>

        {/* Natywny Input */}
        <input
          id={uniqueId}
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder || t("searchPlaceholder")}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDownInternal}
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={focusedIndex >= 0 ? getOptionId(focusedIndex) : undefined}
          className={`
            w-full h-12 pl-11 ${isLoading ? "pr-11" : "pr-4"}
            bg-[var(--color-brand-navy-dark)] 
            text-[var(--color-brand-text)] 
            placeholder:[var(--color-brand-text-muted)] placeholder:opacity-70
            font-sans text-sm sm:text-base
            border border-[var(--color-brand-navy-light)] 
            rounded-[var(--radius-brand-card)]
            transition-all duration-300 outline-none
            hover:border-[var(--color-brand-text-muted)]
            focus:border-[var(--color-brand-yellow-hover)] focus:ring-1 focus:ring-[var(--color-brand-yellow-hover)]
          `.trim()}
          {...props}
        />

        {/* Wskaźnik ładowania z prawej */}
        {isLoading && (
          <div className="absolute right-3.5 inset-y-0 flex items-center pointer-events-none text-[var(--color-brand-yellow-hover)]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {/* ROZWIJANA LISTA WYNIKÓW */}
      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label || "Search results"}
          className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto text-btn-mono shadow-xl bg-[color-mix(in_srgb,var(--color-brand-navy-dark)_95%,transparent)] backdrop-blur-md border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)]"
        >
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-xs text-btn-mono text-[var(--color-brand-text-muted)] opacity-60">
              {t("noResults")}
            </div>
          ) : (
            results.map((item, index) => {
              const isKeyboardFocused = index === focusedIndex;
              return (
                <div
                  key={item.guid}
                  id={getOptionId(index)}
                  role="option"
                  aria-selected={isKeyboardFocused}
                  onClick={() => handleItemClick(item)}
                  className={`
                    p-3 cursor-pointer flex justify-between items-center transition-colors
                    border-b border-[var(--color-brand-navy-light)] last:border-b-0
                    ${isKeyboardFocused 
                      ? "bg-[color-mix(in_srgb,var(--color-brand-text)_10%,transparent)]" 
                      : "hover:bg-[color-mix(in_srgb,var(--color-brand-text)_6%,transparent)]"
                    }
                  `.trim()}
                >
                  {RenderItem ? (
                    <RenderItem item={item} />
                  ) : (
                    <span className="text-btn-mono text-[var(--color-brand-text)]">
                      {item.mainName}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}