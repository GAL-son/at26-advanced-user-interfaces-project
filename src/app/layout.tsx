import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import DebugThemeToggle from "./_components/DebugThemeToggle"; // <--- Import przycisku

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simracing App",
  description: "Esport & ELO Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      data-mui-color-scheme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
      </head>
      <body className="min-h-full flex flex-col bg-brand-navy text-brand-muted transition-colors duration-200">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
          {/* Przycisk ląduje na samym dole DOM-u aplikacji */}
          <DebugThemeToggle /> 
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}