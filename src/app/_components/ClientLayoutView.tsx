"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
// 1. Importujemy ThemeProvider oraz createTheme z MUI
import { ThemeProvider, createTheme } from '@mui/material/styles'; 
import { Box } from "@mui/material";

import TopBarMenu from "@/app/_components/Menu/TopBarMenu";
import DrawerMenu from "@/app/_components/Menu/DrawerMenu";

import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

// 2. Tworzymy podstawową konfigurację motywu wspierającą CSS Variables
const theme = createTheme({
  cssVariables: {
    // Wskazujemy MUI, że ma używać atrybutu zamiast klas
    colorSchemeSelector: 'data-mui-color-scheme', 
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
  defaultColorScheme: 'dark', // Aplikacja domyślnie startuje jako ciemna
});

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
      <ThemeProvider theme={theme}>
        <div data-sction="menu">
          <TopBarMenu
            navItems={navItems}
            pathname={pathname}
            onDrawerToggle={handleDrawerToggle}
          />
        </div>

        <DrawerMenu
          navItems={navItems}
          pathname={pathname}
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '1280px',
            mx: 'auto',
            pt: 0,
            mt: 0,
            px: { xs: 2, md: 4 },
            pb: { xs: 2, md: 4 }
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}