"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles'; 
import { Box } from "@mui/material";

import TopBarMenu from "@/app/_components/Menu/TopBarMenu";
import DrawerMenu from "@/app/_components/Menu/DrawerMenu";
import Footer from "@/app/_components/Footer/Footer"; // Import nowej stopki

import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme', 
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
  defaultColorScheme: 'dark',
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
        {/* Kontener zapewniający stopkę na dole ekranu dzięki min-h-screen i flex-col */}
        <div className="flex flex-col min-h-screen bg-brand-navy-darkest"> 
          
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

          {/* Główna treść strony zajmuje całą dostępną przestrzeń (flex-grow) */}
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
              pb: { xs: 4, md: 6 } // Zwiększyłem delikatnie dolny padding
            }}
          >
            {children}
          </Box>

          {/* Wyrenderowana stopka */}
          <Footer />
        </div>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}