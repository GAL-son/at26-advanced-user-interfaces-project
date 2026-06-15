"use client";

import { useEffect } from "react";

/**
 * Hook automatycznie przenoszący focus na pierwszy element sekcji na stronie
 * dla użytkowników nawigujących za pomocą klawiatury.
 * * @param dataAttr Nazwa atrybutu szukanego w DOM. Domyślnie 'data-section-page-start'
 */
export function usePageInitialFocus(dataAttr = "data-section-page-start") {
  useEffect(() => {
    // Funkcja pomocnicza do bezpiecznego ustawiania focusu
    const focusStartElement = () => {
      const startElement = document.querySelector(`[${dataAttr}="true"]`) as HTMLElement;
      if (!startElement) return false;

      // Jeśli kontener ma tabIndex, to focusujemy go bezpośrednio
      if (startElement.tabIndex >= 0) {
        startElement.focus();
        return true;
      } 
      
      // W przeciwnym wypadku szukamy pierwszego interaktywnego dziecka
      const focusableInner = startElement.querySelector(
        'button, [tabindex="0"], a, input, select, textarea'
      ) as HTMLElement;
      
      if (focusableInner) {
        focusableInner.focus();
        return true;
      }

      return false;
    };

    // Case 1: Użytkownik ma już zapisaną intencję używania klawiatury z poprzedniej podstrony
    const isKeyboardUser = localStorage.getItem("user-intent") === "keyboard";
    if (isKeyboardUser) {
      // Dajemy mikro-timeout, aby Next.js zdążył w pełni zamontować i wyrenderować komponenty potomne
      const timer = setTimeout(() => {
        focusStartElement();
      }, 50);
      return () => clearTimeout(timer);
    }

    // Case 2: Użytkownik dopiero teraz (na tej stronie) kliknął pierwszy raz TAB
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === "Tab" && document.activeElement === document.body) {
        // Próbujemy złapać nasz dedykowany element startowy
        const success = focusStartElement();
        if (success) {
          e.preventDefault(); // Blokujemy domyślny skok przeglądarki "w ciemno"
          localStorage.setItem("user-intent", "keyboard");
          window.removeEventListener("keydown", handleFirstTab);
        }
      }
    };

    window.addEventListener("keydown", handleFirstTab);
    return () => window.removeEventListener("keydown", handleFirstTab);
  }, [dataAttr]);
}