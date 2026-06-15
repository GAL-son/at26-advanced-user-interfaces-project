"use client";

import React from "react";
import Link from "next/link";
import { Box, Drawer, Typography, Divider, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import DebugThemeToggle from "@/app/_components/DebugThemeToggle";

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
    return (
        <Box component="nav">
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                // Definiujemy czas trwania animacji (opcjonalnie, domyślny w MUI jest już bardzo płynny)
                transitionDuration={{ enter: 400, exit: 300 }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 260,
                        borderRight: '1px solid var(--color-brand-navy-light)',
                        // KLUCZOWE: Tło przypisujemy do Paper, dzięki czemu cała karta płynnie się wysuwa
                        bgcolor: 'var(--color-brand-navy-dark)',
                        color: 'var(--color-brand-text)',
                    },
                }}
            >
                {/* Usunęliśmy stąd bgcolor i color, bo Drawer-paper teraz to kontroluje */}
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
                                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                    {/* Dół menu mobilnego */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--color-brand-navy-light)' }}>
                        <DebugThemeToggle />
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}