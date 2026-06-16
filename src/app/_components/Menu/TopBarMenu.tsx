"use client";

import React from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AppBar, Box, Toolbar, IconButton, Typography, Button, Container } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SpeedIcon from "@mui/icons-material/Speed";
import LanguageIcon from "@mui/icons-material/Language";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { focusFlatSection } from "@/app/_utils/navigation";
import ThemeToggle from "../Common/ThemeTogle";

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

  const t = useTranslations("Menu");
  const router = useRouter();
  const currentPathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = t("currentLocale") === "pl" ? "en" : "pl";
    router.replace(currentPathname, { locale: nextLocale });
  };

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

          {/* LOGO: Desktop */}
          <Typography
            noWrap
            component={Link}
            href="/"
            ref={registerItem(0)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            tabIndex={0}
            /* Migracja na czysty token v4 z wymuszeniem koloru tekstu */
            className="focus-brand !text-nav-logo rounded px-2 py-1 flex outline-none no-underline items-center gap-2 !text-brand-text"
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <SpeedIcon className="text-brand-yellow-hover" /> Simracing App
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
            noWrap
            component={Link}
            href="/drivers"
            tabIndex={0}
            /* Migracja na czysty token v4 */
            className="focus-brand !text-nav-logo rounded px-2 no-underline items-center gap-2 !text-brand-text"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <SpeedIcon className="text-brand-yellow-hover" /> Simracing App
          </Typography>

          {/* LINKI NAWIGACJI: Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item, index) => {
              const isActive = currentPathname.startsWith(item.path);
              const currentItemIndex = index + 1;

              return (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  ref={registerItem(currentItemIndex)}
                  onKeyDown={(e) => handleKeyDown(e, currentItemIndex)}
                  tabIndex={-1}
                  /* Użycie natywnych przezroczystości v4 (bg-brand-text/6) zamiast skomplikowanego CSS color-mix */
                  className={`focus-brand !text-nav-link normal-case flex items-center px-4 py-2 rounded-md transition-all duration-200 
                  ${isActive
                      ? '!font-bold !text-brand-text bg-brand-text/6'
                      : '!font-medium !text-brand-text-muted bg-transparent'
                    } 
                  hover:bg-brand-text/10 hover:!text-brand-text`}
                  sx={{
                    display: 'flex',
                  }}
                >
                  <span className="mr-2 flex items-center">{item.icon}</span>
                  {t(item.label)}
                </Button>
              );
            })}
          </Box>

          {/* PRZYCISKI FUNKCYJNE: Język i Motyw */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>

            {/* PRZYCISK ZMIANY JĘZYKA */}
            <Button
              onClick={toggleLanguage}
              variant="text"
              size="small"
              startIcon={<LanguageIcon />}
              /* Wyczyszczenie opacity i color-mix na rzecz v4 utilities */
              className="!text-nav-button uppercase !text-brand-text-muted hover:!text-brand-text hover:bg-brand-text/6"
            >
              {t("switchLanguageTo")}
            </Button>

            {/* PRZYCISK MOTYWU: Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <ThemeToggle />
            </Box>

          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}