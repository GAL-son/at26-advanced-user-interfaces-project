import { useRef } from "react";

interface NavigationConfig {
  /** Liczba wszystkich elementów w komponencie */
  itemCount: number;
  /** Wymiar wewnętrzny: 'horizontal' (prawo/lewo) lub 'vertical' (góra/dół) */
  orientation: "horizontal" | "vertical";
  /** Czy nawigacja ma się zapętlać wewnątrz komponentu (domyślnie: true) */
  loop?: boolean; // NOWOŚĆ
  /** Callback wywoływany, gdy użytkownik chce wyjść z komponentu */
  onLeave?: (direction: "prev" | "next") => void;
  /** Opcjonalny callback wywoływany przy zmianie indeksu */
  onIndexChange?: (newIndex: number, targetElement: HTMLElement) => void;
}

export function useKeyboardNavigation({
  itemCount,
  orientation,
  loop = true, // Domyślnie włączone zapętlanie
  onLeave,
  onIndexChange,
}: NavigationConfig) {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, currentIndex: number) => {
    const isHorizontal = orientation === "horizontal";

    // Definiujemy klawisze w zależności od orientacji komponentu
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const leaveNextKey = isHorizontal ? "ArrowDown" : "ArrowRight";
    const leavePrevKey = isHorizontal ? "ArrowUp" : "ArrowLeft";

    // 1. Ruch WEWNĄTRZ komponentu (lub wyjście przez krawędź przy loop: false)
    if (e.key === nextKey || e.key === prevKey) {
      
      // Sprawdzamy krawędzie, jeśli zapętlanie jest WYŁĄCZONE
      if (!loop) {
        if (e.key === nextKey && currentIndex === itemCount - 1) {
          // Jesteśmy na ostatnim elemencie i klikamy "w przód" -> wychodzimy z bloku
          if (onLeave) {
            e.preventDefault();
            onLeave("next");
          }
          return;
        }
        if (e.key === prevKey && currentIndex === 0) {
          // Jesteśmy na pierwszym elemencie i klikamy "w tył" -> wychodzimy z bloku
          if (onLeave) {
            e.preventDefault();
            onLeave("prev");
          }
          return;
        }
      }

      // Standardowe obliczanie indeksu (wykona się zawsze przy loop: true, lub gdy nie dotykamy krawędzi przy loop: false)
      e.preventDefault();
      let nextIndex = currentIndex;
      if (e.key === nextKey) {
        nextIndex = (currentIndex + 1) % itemCount;
      } else {
        nextIndex = (currentIndex - 1 + itemCount) % itemCount;
      }

      const targetElement = itemsRef.current[nextIndex];
      if (targetElement) {
        targetElement.focus();
        if (onIndexChange) {
          onIndexChange(nextIndex, targetElement);
        }
      }
      return;
    }

    // 2. WYJŚCIE z komponentu (klawisze prostopadłe - bez zmian)
    if (e.key === leaveNextKey || e.key === leavePrevKey) {
      if (onLeave) {
        e.preventDefault();
        onLeave(e.key === leaveNextKey ? "next" : "prev");
      }
      return;
    }
  };

  const registerItem = (index: number) => (el: HTMLElement | null) => {
    itemsRef.current[index] = el;
  };

  return {
    registerItem,
    handleKeyDown,
  };
}