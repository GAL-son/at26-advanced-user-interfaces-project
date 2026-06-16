/**
 * Przenosi focus do wskazanej sekcji na podstawie atrybutu data-section
 * @param sectionName Nazwa sekcji docelowej (wartość atrybutu data-section)
 * @param blockStyle Jak ma się zachować scroll strony ('start', 'center', 'end', 'nearest')
 */
export function focusSection(sectionName: string, blockStyle: ScrollIntoViewOptions["block"] = "center") {
    if (typeof window === "undefined") return;

    // 1. Znajdź kontener sekcji oznaczony odpowiednim atrybutem
    const section = document.querySelector(`[data-section="${sectionName}"]`);
    if (!section) return;

    // 2. Znajdź pierwszy element wewnątrz tej sekcji, który potrafi przyjąć focus (ma tabIndex=0)
    const firstFocusable = section.querySelector('[tabindex="0"]') as HTMLElement;

    if (firstFocusable) {
        firstFocusable.focus();
        firstFocusable.scrollIntoView({ behavior: "smooth", block: blockStyle });
    }
}

type Direction = "up" | "down" | "left" | "right" | "prev" | "next";

/**
 * Generyczna nawigacja po płaskiej liście sekcji
 * @param currentSection Nazwa sekcji, z której wychodzimy
 * @param direction Kierunek ruchu
 * @param pageOrder Definiowana na poziomie konkretnej strony lista sekcji w odpowiedniej kolejności
 */
export function focusFlatSection(
    currentSection: string,
    direction: Direction,
    pageOrder: string[]
) {
    if (typeof window === "undefined") return;

    const existingSections = pageOrder.filter(sectionName => {
        if (sectionName === "menu") return true;
        return document.querySelector(`[data-section="${sectionName}"]`) !== null;
    });

    let currentIndex = existingSections.indexOf(currentSection);
    if (currentIndex === -1) return;

    const isMovingForward = direction === "down" || direction === "right" || direction === "next";

    let targetIndex = currentIndex;
    let attempts = 0;

    while (attempts < existingSections.length) {
        attempts++;

        if (isMovingForward) {
            targetIndex = (targetIndex + 1) % existingSections.length;
        } else {
            targetIndex = (targetIndex - 1 + existingSections.length) % existingSections.length;
        }

        const targetSectionName = existingSections[targetIndex];

        if (targetSectionName === "menu") {
            const menuSection = document.querySelector('[data-section="menu"]');
            const menuFocusable = menuSection?.querySelector('[tabindex="0"]') as HTMLElement;
            if (menuFocusable && menuSection) {
                menuFocusable.focus();
                menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
            }
        }

        const section = document.querySelector(`[data-section="${targetSectionName}"]`);
        if (section) {
            // KLUCZOWA ZMIANA: Szukamy elementu z jawnym priorytetem wejścia,
            // a jeśli go nie ma (w 95% innych komponentów), bierzemy domyślny pierwszy z brzegu.
            const bestFocusable = (
                section.querySelector('[data-focus-order="primary"]') ||
                section.querySelector('[tabindex="0"]')
            ) as HTMLElement | null;

            if (bestFocusable) {
                bestFocusable.focus();
                bestFocusable.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }
        }
    }
}