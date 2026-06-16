// src/app/(routes)/[locale]/layout.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import ClientLayoutView from "@/app/_components/ClientLayoutView";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased custom-scrollbar`}
    >
      <head>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
      </head>
      {/* DODANO: m-0 p-0 do klasy body */}
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