"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import DebugThemeToggle from "./_components/DebugThemeToggle";
import "./globals.css";

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SpeedIcon from "@mui/icons-material/Speed";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

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

  // Menu boczne z przyciskiem na samym dole
  const drawerContent = (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%', 
        bgcolor: 'var(--brand-navy, #0a0e17)', 
        color: 'var(--brand-muted, #94a3b8)',
        p: 2 
      }}
    >
      {/* Góra menu */}
      <Box sx={{ flexGrow: 1 }} onClick={handleDrawerToggle}>
        <Typography 
          variant="h6" 
          sx={{ my: 2, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <SpeedIcon /> Simracing App
        </Typography>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <List>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton 
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 1,
                    my: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
                    }
                  }}
                >
                  {item.icon}
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Dół menu mobilnego: Przycisk motywu */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <DebugThemeToggle />
      </Box>
    </Box>
  );

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
          
          <AppBar 
            position="sticky" 
            color="transparent" 
            elevation={0} 
            sx={{ 
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              bgcolor: 'rgba(10, 14, 23, 0.8)'
            }}
          >
            <Container maxWidth="xl">
              <Toolbar disableGutters sx={{ height: 64 }}>
                
                {/* LOGO: Desktop */}
                <Typography
                  variant="h6"
                  noWrap
                  component={Link}
                  href="/drivers"
                  sx={{
                    mr: 4,
                    display: { xs: 'none', md: 'flex' },
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: 'inherit',
                    textDecoration: 'none',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SpeedIcon color="primary" /> Simracing App
                </Typography>

                {/* HAMBURGER: Mobile */}
                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                  <IconButton
                    size="large"
                    aria-label="open drawer"
                    onClick={handleDrawerToggle}
                    color="inherit"
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>

                {/* LOGO: Mobile */}
                <Typography
                  variant="h6"
                  noWrap
                  component={Link}
                  href="/drivers"
                  sx={{
                    flexGrow: 1,
                    display: { xs: 'flex', md: 'none' },
                    fontWeight: 800,
                    color: 'inherit',
                    textDecoration: 'none',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SpeedIcon color="primary" /> Simracing App
                </Typography>

                {/* LINKI NAWIGACJI: Desktop */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Button
                        key={item.label}
                        component={Link}
                        href={item.path}
                        sx={{ 
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', 
                          display: 'flex',
                          alignItems: 'center',
                          textTransform: 'none',
                          fontWeight: isActive ? 600 : 500,
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.08)',
                            color: '#fff'
                          }
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    );
                  })}
                </Box>

                {/* PRZYCISK MOTYWU: Desktop (Całkowicie po prawej stronie) */}
                <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 'auto' }}>
                  <DebugThemeToggle />
                </Box>

              </Toolbar>
            </Container>
          </AppBar>

          {/* Szuflada mobilna (Drawer) */}
          <Box component="nav">
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: 260,
                  borderRight: '1px solid rgba(255,255,255,0.08)'
                },
              }}
            >
              {drawerContent}
            </Drawer>
          </Box>

          {/* Główna zawartość strony */}
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