/**
 * Formatuje datę ostatniego wyścigu na czytelny tekst względny (np. "Today", "Yesterday", "3 days ago")
 * lub zwraca sformatowaną datę kalendarzową dla starszych wpisów.
 * * @param dateString - String reprezentujący datę lub null/N/A
 * @returns Sformatowany ciąg znaków w języku angielskim
 */
export function formatLastRaced(dateString: string | null): string {
  if (!dateString || dateString === "N/A") return 'No races recorded';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'No races recorded';

  const now = new Date();
  
  // Zerujemy godziny, minuty, sekundy i milisekundy, aby porównywać tylko pełne dni kalendarzowe
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Różnica w milisekundach przeliczona na dni
  const diffTime = startOfNow.getTime() - startOfDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;

  // Dla dat starszych niż tydzień zwracamy format MM/DD/YYYY
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}