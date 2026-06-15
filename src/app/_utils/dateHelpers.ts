export function formatLastRaced(dateString: string | null, locale: string = 'en'): string {
  if (!dateString || dateString === "N/A") {
    return locale === 'pl' ? 'Brak zarejestrowanych wyścigów' : 'No races recorded';
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return locale === 'pl' ? 'Brak zarejestrowanych wyścigów' : 'No races recorded';
  }

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Wykorzystujemy systemowy Intl.RelativeTimeFormat wbudowany w przeglądarki i Node.js
  if (diffDays <= 7) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    // rtf formatuje na podstawie wartości ujemnej dla przeszłości (np. -3 dni -> "3 dni temu")
    return rtf.format(-diffDays, 'day');
  }

  // Format kalendarzowy dopasowany do kraju
  return date.toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}