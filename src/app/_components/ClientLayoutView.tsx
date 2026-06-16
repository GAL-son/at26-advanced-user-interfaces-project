// src/app/(routes)/[locale]/ClientLayoutView.tsx
"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Box } from "@mui/material";

import TopBarMenu from "@/app/_components/Menu/TopBarMenu";
import DrawerMenu from "@/app/_components/Menu/DrawerMenu";

import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

// UWAGA: Zamiast sztywnych stringów, linki w menu mogą być czystymi ścieżkami bazowymi,
// ponieważ komponent <Link> z '@i18n/routing' sam automatycznie doklei /pl lub /en wewnątrz TopBarMenu/DrawerMenu!
const navItems = [
  { label: "drivers", path: "/drivers", icon: <GroupIcon sx={{ mr: 1 }} /> },
  { label: "events", path: "/events", icon: <EventIcon sx={{ mr: 1 }} /> },
  { label: "compare", path: "/drivers/compare", icon: <CompareArrowsIcon sx={{ mr: 1 }} /> },
];

export default function ClientLayoutView({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
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
  );
}