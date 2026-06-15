"use client";

import React from "react";
import Link from "next/link";
import { AppBar, Box, Toolbar, IconButton, Typography, Button, Container } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SpeedIcon from "@mui/icons-material/Speed";
import DebugThemeToggle from "@/app/_components/DebugThemeToggle";

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface TopBarMenuProps {
    navItems: NavItem[];
    pathname: string;
    onDrawerToggle: () => void;
}

export default function TopBarMenu({ navItems, pathname, onDrawerToggle }: TopBarMenuProps) {
    return (
        <AppBar
            position="sticky"
            color="transparent"
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
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 4,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 900,
                            letterSpacing: '-0.5px',
                            color: 'var(--color-brand-text)',
                            textDecoration: 'none',
                            alignItems: 'center',
                            gap: 1
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
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.path);
                            return (
                                <Button
                                    key={item.label}
                                    component={Link}
                                    href={item.path}
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