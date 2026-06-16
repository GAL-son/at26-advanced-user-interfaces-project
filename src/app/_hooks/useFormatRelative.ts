import { useFormatter, useTranslations, useNow } from "next-intl";

export function useFormatRelative() {
  const format = useFormatter();
  const t = useTranslations("Home");
  // useNow() pobiera spójny czas teraźniejszy dla serwera i klienta
  const now = useNow(); 

  const formatDaysAgo = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === "N/A") {
      return t("noRaces");
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return t("noRaces");
    }

    // Przekazujemy { now } jako drugi parametr konfiguracyjny
    return format.relativeTime(date, { now });
  };

  return { formatDaysAgo };
}