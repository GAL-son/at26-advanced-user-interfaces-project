import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  // Zabezpieczenie: jeśli locale z URL jest nieznane lub puste, użyj domyślnego (en)
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    // Dynamicznie importujemy plik JSON z folderu /messages w roocie projektu
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});