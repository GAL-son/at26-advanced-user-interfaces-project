"use client";

import React from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AppBar, Box, Toolbar, IconButton, Button, Container } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { focusFlatSection } from "@/app/_utils/navigation";
import ThemeToggle from "../Common/ThemeTogle";
import BrandLogo from "./BrandLogo"; // Import nowego komponentu
import { Link } from "@/i18n/routing";
import LanguageIcon from "@mui/icons-material/Language";

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

  // Całkowita liczba elementów na desktopie: Logo (1) + Linki (navItems.length) + Język (1) + Motyw (1)
  const totalDesktopItems = 1 + navItems.length + 2;

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

  const languageButtonIndex = 1 + navItems.length;
  const themeToggleIndex = languageButtonIndex + 1;

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

          {/* LOGO (Desktop) - Indeks 0 */}
          <BrandLogo 
            variant="desktop" 
            registerRef={registerItem(0)} 
            onKeyDown={(e) => handleKeyDown(e, 0)} 
          />

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
          <BrandLogo variant="mobile" />

          {/* LINKI NAWIGACJI (Desktop) */}
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
                  tabIndex={0}
                  className={`focus-brand !text-nav-link normal-case flex items-center px-4 py-2 rounded-md transition-all duration-200 
                    ${isActive
                      ? '!font-bold !text-brand-text bg-brand-text/6'
                      : '!font-medium !text-brand-text-muted bg-transparent'
                    } 
                    hover:bg-brand-text/10 hover:!text-brand-text
                    focus:bg-brand-text/10 focus:ring-2 focus:ring-[var(--color-brand-yellow-hover)] focus:outline-none`}
                >
                  <span className="mr-2 flex items-center">{item.icon}</span>
                  {t(item.label)}
                </Button>
              );
            })}
          </Box>

          {/* PRZYCISKI FUNKCYJNE */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>

            {/* JĘZYK */}
            <Button
              onClick={toggleLanguage}
              ref={registerItem(languageButtonIndex)}
              onKeyDown={(e) => handleKeyDown(e, languageButtonIndex)}
              tabIndex={0}
              variant="text"
              size="small"
              startIcon={<LanguageIcon />}
              className="focus-brand !text-nav-button uppercase !text-brand-text-muted hover:!text-brand-text hover:bg-brand-text/6 focus:bg-brand-text/10 focus:ring-2 focus:ring-[var(--color-brand-yellow-hover)] focus:outline-none"
            >
              {t("switchLanguageTo")}
            </Button>

            {/* MOTYW */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <ThemeToggle
                focusableRef={registerItem(themeToggleIndex)}
                onKeyDown={(e) => handleKeyDown(e, themeToggleIndex)}
              />
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}