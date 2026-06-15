"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Box } from "@mui/material";

// Import nowych komponentów nawigacji
import TopBarMenu from "@/app/_components/Menu/TopBarMenu";
import DrawerMenu from "@/app/_components/Menu/DrawerMenu";

import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navItems = [
  { label: "Kierowcy", path: "/drivers", icon: <GroupIcon sx={{ mr: 1 }} /> },
  { label: "Wydarzenia", path: "/events", icon: <EventIcon sx={{ mr: 1 }} /> },
  { label: "Porównywarka", path: "/drivers/compare", icon: <CompareArrowsIcon sx={{ mr: 1 }} /> },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <html
      lang="pl"
      data-mui-color-scheme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--color-brand-navy)', color: 'var(--color-brand-text)' }}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>

          {/* GÓRNY PASEK NAWIGACJI */}
          <div data-sction="menu">
            <TopBarMenu
              navItems={navItems}
              pathname={pathname}
              onDrawerToggle={handleDrawerToggle}
            />
          </div>

          {/* SZUFLADA MOBILNA (DRAWER) */}
          <DrawerMenu
            navItems={navItems}
            pathname={pathname}
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
          />

          {/* GŁÓWNA ZAWARTOŚĆ STRONY */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 4 },
              width: '100%',
              maxWidth: '1280px',
              mx: 'auto'
            }}
          >
            {children}
          </Box>

        </AppRouterCacheProvider>
      </body>
    </html>
  );
}