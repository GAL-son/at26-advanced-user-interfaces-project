// src/app/(routes)/[locale]/layout.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Rajdhani, Orbitron, Share_Tech_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import ClientLayoutView from "@/app/_components/ClientLayoutView";
import "@/app/globals.css";

// 1. Ładowanie czcionek motorsportowych
const rajdhaniSans = Rajdhani({
  variable: "--font-sans", // Mapuje się bezpośrednio na domyślny font-sans w globals.css
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono", // Mapuje się na text-btn-mono / font-mono
  subsets: ["latin"],
  weight: ["400"],
});

const orbitronDisplay = Orbitron({
  variable: "--font-display", // Mapuje się na nagłówki i logo
  subsets: ["latin"],
  weight: ["700", "900"],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-mui-color-scheme="dark"
      /* 2. Wstrzyknięcie klas ze zmiennymi do tagu html */
      className={`${rajdhaniSans.variable} ${shareTechMono.variable} ${orbitronDisplay.variable} h-full antialiased custom-scrollbar`}
    >
      <head>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
      </head>
      <body
        className="min-h-full m-0 p-0 flex flex-col transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text)' }}
      >
        <NextIntlClientProvider messages={messages}>
          <ClientLayoutView>
            {children}
          </ClientLayoutView>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}