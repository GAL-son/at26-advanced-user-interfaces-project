"use client";
import { useColorScheme } from "@mui/material/styles";
import { useCallback } from "react";

export function useThemeSwitch() {
  const { mode, setMode } = useColorScheme();

  const toggleTheme = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  return { mode, toggleTheme };
}