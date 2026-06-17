"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { Typography } from "@mui/material";
import SportsMotorsportsIcon from "@mui/icons-material/SportsMotorsports";

interface BrandLogoProps {
  variant: "desktop" | "mobile";
  registerRef?: React.RefCallback<any>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function BrandLogo({ variant, registerRef, onKeyDown }: BrandLogoProps) {
  const isDesktop = variant === "desktop";

  return (
    <Typography
      noWrap
      component={Link}
      href={"/"}
      {...(isDesktop && registerRef ? { ref: registerRef } : {})}
      {...(isDesktop && onKeyDown ? { onKeyDown } : {})}
      tabIndex={0}
      className={`focus-brand !text-nav-logo rounded px-2 py-1 flex outline-none no-underline items-center gap-2 !text-brand-text`}
      sx={{
        mr: isDesktop ? 4 : 0,
        flexGrow: isDesktop ? 0 : 1,
        display: isDesktop ? { xs: "none", md: "flex" } : { xs: "flex", md: "none" },
      }}
    >
      <SportsMotorsportsIcon className="text-brand-yellow-hover" /> ACSM Portal
    </Typography>
  );
}