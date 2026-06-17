"use client";

import React, { Suspense } from "react";
import { Box } from "@mui/material";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface PageLoaderWrapperProps {
  children: React.ReactNode;
  loadingText?: string;
  backgroundColor?: string;
  spinnerSize?: number;
}

export default function PageLoaderWrapper({
  children,
  loadingText = "Loading...", // Domyślny fallback tekstowy
  backgroundColor = "var(--color-brand-navy)", // Domyślny kolor z Twojego systemu designu
  spinnerSize = 20,
}: PageLoaderWrapperProps) {
  return (
    <Suspense
      fallback={
        <Box
          className="min-h-screen flex flex-col items-center justify-center gap-3"
          sx={{ backgroundColor }}
        >
          <LoadingSpinner
            text={loadingText}
            size={spinnerSize}
            className="py-2 px-4"
          />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}