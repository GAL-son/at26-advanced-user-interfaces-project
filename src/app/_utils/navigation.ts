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

    // 1. Zostawiamy na liście tylko te sekcje, które fizycznie istnieją jako tagi w DOM
    const existingSections = pageOrder.filter(sectionName => {
        if (sectionName === "menu") return true;
        return document.querySelector(`[data-section="${sectionName}"]`) !== null;
    });

    // 2. Znajdź indeks obecnej sekcji
    let currentIndex = existingSections.indexOf(currentSection);
    if (currentIndex === -1) return;

    // 3. Określamy kierunek (w przód / w tył)
    const isMovingForward = direction === "down" || direction === "right" || direction === "next";

    // Tworzymy kopię indeksu do przeszukiwania w pętli
    let targetIndex = currentIndex;
    let attempts = 0;

    // Szukamy tak długo, aż trafimy na element, który ma w środku [tabindex="0"]
    // Zabezpieczenie (attempts) chroni przed nieskończoną pętlą, gdyby cała strona była pusta
    while (attempts < existingSections.length) {
        attempts++;

        if (isMovingForward) {
            targetIndex = (targetIndex + 1) % existingSections.length; // Ładne zawijanie na koniec tablicy
        } else {
            targetIndex = (targetIndex - 1 + existingSections.length) % existingSections.length; // Ładne zawijanie na początek
        }

        const targetSectionName = existingSections[targetIndex];

        // Menu zawsze traktujemy jako sukces i bezpieczną przystań
        if (targetSectionName === "menu") {
            const menuSection = document.querySelector('[data-section="menu"]');
            const menuFocusable = menuSection?.querySelector('[tabindex="0"]') as HTMLElement;
            if (menuFocusable) {
                menuFocusable.focus();
                menuFocusable.scrollIntoView({ behavior: "smooth", block: "start" });
                return; // Sukces, wychodzimy
            }
        }

        // Dla pozostałych sekcji sprawdzamy, czy mają interaktywny środek
        const section = document.querySelector(`[data-section="${targetSectionName}"]`);
        if (section) {
            const firstFocusable = section.querySelector('[tabindex="0"]') as HTMLElement;
            if (firstFocusable) {
                // Znaleźliśmy działającą sekcję! Focus i scroll.
                firstFocusable.focus();
                firstFocusable.scrollIntoView({ behavior: "smooth", block: "center" });
                return; // Sukces, wychodzimy
            }
        }
    }
}