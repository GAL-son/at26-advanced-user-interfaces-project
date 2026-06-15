"use client";

import React from "react";
// WAŻNE: Podmieniamy domyślny Link oraz importujemy narzędzia nawigacji i18n
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Box, Drawer, Typography, Divider, List, ListItem, ListItemButton, ListItemText, Button } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import LanguageIcon from "@mui/icons-material/Language";
import DebugThemeToggle from "@/app/_components/DebugThemeToggle";

interface NavItem {
    label: string; // Przekazujemy tu klucze tłumaczeń: "drivers", "events", "compare"
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

    // Funkcja do przełączania języka w wersji mobilnej
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
                        <Link href='/'>
                            <Typography
                                variant="h6"
                                sx={{ my: 2, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, textTransform: 'uppercase' }}
                            >
                                <SpeedIcon sx={{ color: 'var(--color-brand-yellow-hover)' }} /> Simracing App
                            </Typography>
                        </Link>
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
                                            {item.icon}
                                            {/* Dynamiczne wyciąganie przetłumaczonego tekstu z pliku JSON */}
                                            <ListItemText 
                                                primary={t(item.label)} 
                                                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                    {/* Dół menu mobilnego z selektorem motywu i języka */}
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
                            sx={{
                                color: 'var(--color-brand-text)',
                                borderColor: 'var(--color-brand-navy-light)',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: 'var(--color-brand-text)',
                                    bgcolor: 'color-mix(in srgb, var(--color-brand-text) 4%, transparent)'
                                }
                            }}
                        >
                            {t("switchLanguageTo")}
                        </Button>

                        <DebugThemeToggle />
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}