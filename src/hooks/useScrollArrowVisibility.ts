import { useState, useEffect, useRef } from "react";

interface UseScrollArrowOptions {
  hasMore: boolean;
  onIntersect?: () => void;
}

export function useScrollArrowVisibility(
  targetRef: React.RefObject<HTMLElement | null>,
  { hasMore, onIntersect }: UseScrollArrowOptions
) {
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [showScrollArrow, setShowScrollArrow] = useState<boolean>(false);

  // Przechowujemy najnowszy callback, aby nie resetować Observera przy każdej zmianie zależności
  const onIntersectRef = useRef(onIntersect);
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  // 1. Monitorowanie przewijania (czy użytkownik jest na samej górze)
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Intersection Observer dla dolnego elementu buforowego
  useEffect(() => {
    const currentTarget = targetRef.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;

        if (isIntersecting) {
          setShowScrollArrow(false);
          // Odpalamy akcję (np. ładowanie danych), jeśli została przekazana
          onIntersectRef.current?.();
        } else {
          setShowScrollArrow(hasMore);
        }
      },
      { rootMargin: "0px" }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, targetRef]);

  // Zwracamy finalny stan widoczności strzałki
  return showScrollArrow && isAtTop;
}