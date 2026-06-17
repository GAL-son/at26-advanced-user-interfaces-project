"use client";

import React from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Box, Drawer, Divider, List, ListItem, ListItemButton, ListItemText, Button } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import ThemeToggle from "../Common/ThemeTogle";
import BrandLogo from "./BrandLogo"; // Import wspólnego komponentu logo

interface NavItem {
  label: string; 
  path: string;
  icon: React.ReactNode;
}

interface DrawerMenuProps {
  navItems: NavItem[];
  pathname: string;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export default function DrawerMenu({ navItems, pathname, mobileOpen, onDrawerToggle }: DrawerMenuProps) {
  const t = useTranslations("Menu");
  const router = useRouter();
  const currentPathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = t("currentLocale") === "pl" ? "en" : "pl";
    router.replace(currentPathname, { locale: nextLocale });
  };

  return (
    <Box component="nav">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        transitionDuration={{ enter: 400, exit: 300 }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 260,
            borderRight: '1px solid var(--color-brand-navy-light)',
            bgcolor: 'var(--color-brand-navy-dark)',
            color: 'var(--color-brand-text)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: 2
          }}
        >
          {/* Góra menu */}
          <Box sx={{ flexGrow: 1 }} onClick={onDrawerToggle}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              {/* Zwróć uwagę, że BrandLogo wewnętrznie posiada już komponent Link */}
              <BrandLogo variant="mobile" />
            </Box>
            
            <Divider sx={{ borderColor: 'var(--color-brand-navy-light)', mb: 2 }} />
            
            <List>
              {navItems.map((item) => {
                const isActive = currentPathname.startsWith(item.path);
                return (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      selected={isActive}
                      sx={{
                        borderRadius: 1,
                        my: 0.5,
                        color: isActive ? 'var(--color-brand-text)' : 'var(--color-brand-text-muted)',
                        '&.Mui-selected': {
                          bgcolor: 'color-mix(in srgb, var(--color-brand-text) 8%, transparent)',
                          color: 'var(--color-brand-text)',
                          '&:hover': { bgcolor: 'color-mix(in srgb, var(--color-brand-text) 12%, transparent)' }
                        },
                        '&:hover': {
                          bgcolor: 'color-mix(in srgb, var(--color-brand-text) 4%, transparent)',
                        }
                      }}
                    >
                      {/* Ikona z odstępem z Tailwinda */}
                      <span className="mr-3 flex items-center">{item.icon}</span>
                      
                      {/* Wymuszenie stylów !text-nav-link dla tekstu w liście */}
                      <ListItemText 
                        primary={t(item.label)} 
                        className={`!text-nav-link ${isActive ? '!font-bold !text-brand-text' : '!font-medium !text-brand-text-muted'}`}
                        disableTypography 
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Dół menu mobilnego */}
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2,
              borderTop: '1px solid var(--color-brand-navy-light)' 
            }}
          >
            {/* MOBILNY PRZYCISK ZMIANY JĘZYKA */}
            <Button
              onClick={toggleLanguage}
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<LanguageIcon />}
              className="!text-nav-button uppercase !text-brand-text !border-brand-navy-light hover:!border-brand-text hover:bg-brand-text/4"
            >
              {t("switchLanguageTo")}
            </Button>

            <ThemeToggle />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}