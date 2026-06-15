"use client";

import React from "react";
import Link from "next/link";
import { AppBar, Box, Toolbar, IconButton, Typography, Button, Container } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SpeedIcon from "@mui/icons-material/Speed";
import DebugThemeToggle from "@/app/_components/DebugThemeToggle";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { focusFlatSection } from "@/app/_utils/navigation";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface TopBarMenuProps {
  navItems: NavItem[];
  pathname: string;
  onDrawerToggle: () => void;
  currentPageSections?: string[];
}

export default function TopBarMenu({ 
  navItems, 
  pathname, 
  onDrawerToggle,
  currentPageSections 
}: TopBarMenuProps) {
  
  // Łączna liczba elementów na desktopie = Logo (1) + Linki (navItems.length)
  const totalDesktopItems = 1 + navItems.length;

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: totalDesktopItems,
    orientation: "horizontal",
    loop: false,
    onLeave: (direction) => {
      if (direction === "next") {
        if (currentPageSections && currentPageSections.length > 0) {
          focusFlatSection("menu", "down", currentPageSections);
        } else {
          const fallbackTarget = 
            document.querySelector('[data-section="page-start"]') || 
            document.querySelector('main');
          
          if (fallbackTarget) {
            const firstFocusable = fallbackTarget.querySelector('[tabindex="0"]') as HTMLElement;
            if (firstFocusable) {
              firstFocusable.focus();
              firstFocusable.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      }
    }
  });

  return (
    <AppBar
      position="sticky"
      color="transparent"
      data-section="menu"
      elevation={0}
      sx={{
        borderBottom: '1px solid var(--color-brand-navy-light)',
        backdropFilter: 'blur(12px)',
        bgcolor: 'color-mix(in srgb, var(--color-brand-navy) 80%, transparent)',
        color: 'var(--color-brand-text)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 64 }}>
          
          {/* LOGO: Desktop (Indeks 0) */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            // REJESTRACJA LOGO W SYSTEMIE NAWIGACJI
            ref={registerItem(0)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            tabIndex={0}
            className="focus-brand rounded px-2 py-1 flex outline-none"
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 900,
              letterSpacing: '-0.5px',
              color: 'var(--color-brand-text)',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SpeedIcon sx={{ color: 'var(--color-brand-yellow-hover)' }} /> Simracing App
          </Typography>

          {/* HAMBURGER: Mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={onDrawerToggle}
              color="inherit"
              className="focus-brand"
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
            tabIndex={0}
            className="focus-brand rounded px-2"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 900,
              color: 'var(--color-brand-text)',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SpeedIcon sx={{ color: 'var(--color-brand-yellow-hover)' }} /> Simracing App
          </Typography>

          {/* LINKI NAWIGACJI: Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item, index) => {
              const isActive = pathname.startsWith(item.path);
              // Przesunięcie indeksów przycisków o +1, ponieważ indeks 0 zajmuje Logo
              const currentItemIndex = index + 1;

              return (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.path}
                  // Korzystamy z przesuniętego indeksu
                  ref={registerItem(currentItemIndex)}
                  onKeyDown={(e) => handleKeyDown(e, currentItemIndex)}
                  // Tylko logo (indeks 0) ma tabIndex={0}, reszta chowa się za -1
                  tabIndex={-1}
                  className="focus-brand"
                  sx={{
                    color: isActive ? 'var(--color-brand-text)' : 'var(--color-brand-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    textTransform: 'none',
                    fontWeight: isActive ? 700 : 500,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: isActive ? 'color-mix(in srgb, var(--color-brand-text) 6%, transparent)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'color-mix(in srgb, var(--color-brand-text) 10%, transparent)',
                      color: 'var(--color-brand-text)'
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* PRZYCISK MOTYWU: Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 'auto' }}>
            <DebugThemeToggle />
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}