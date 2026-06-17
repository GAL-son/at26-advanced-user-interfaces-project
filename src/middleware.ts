import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Rozszerzony matcher, który upewnia się, że Vercel nie dotknie funkcji API oraz zadań Cron
  matcher: [
    '/',
    '/((?!api|cron|_next|_vercel|.*\\..*).*)',
  ]
};