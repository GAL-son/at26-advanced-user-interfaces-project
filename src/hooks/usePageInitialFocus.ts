"use client";

import { useEffect } from "react";

/**
 * Hook automatycznie przenoszący focus na pierwszy element sekcji na stronie.
 * @param dataAttr Nazwa atrybutu szukanego w DOM.
 * @param dependencies Opcjonalna tablica zależności (np. [loading]), która wyzwoli ponowne szukanie focusu
 */
export function usePageInitialFocus(
  dataAttr = "data-section-page-start",
  dependencies: any[] = [] // Dodajemy opcjonalne zależności
) {
  useEffect(() => {
    const focusStartElement = () => {
      const startElement = document.querySelector(`[${dataAttr}="true"]`) as HTMLElement;
      if (!startElement) return false;

      if (startElement.tabIndex >= 0) {
        startElement.focus();
        return true;
      }

      const focusableInner = startElement.querySelector(
        'button, [tabindex="0"], a, input, select, textarea'
      ) as HTMLElement;

      if (focusableInner) {
        focusableInner.focus();
        return true;
      }

      return false;
    };

    const isKeyboardUser = localStorage.getItem("user-intent") === "keyboard";
    if (isKeyboardUser) {
      const timer = setTimeout(() => {
        focusStartElement();
      }, 100); // <-- Zmiana z 50 na 100ms
      return () => clearTimeout(timer);
    }

    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === "Tab" && document.activeElement === document.body) {
        const success = focusStartElement();
        if (success) {
          e.preventDefault();
          localStorage.setItem("user-intent", "keyboard");
          window.removeEventListener("keydown", handleFirstTab);
        }
      }
    };

    window.addEventListener("keydown", handleFirstTab);
    return () => window.removeEventListener("keydown", handleFirstTab);

    // Reagujemy na zmianę przekazanego parametru dataAttr oraz dynamicznych zależności
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataAttr, ...dependencies]);
}