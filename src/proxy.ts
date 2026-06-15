// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  matcher: [
    '/((?!api|cron|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/'
  ]
};