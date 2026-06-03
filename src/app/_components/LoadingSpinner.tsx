"use client";
import React from "react";
import { CircularProgress } from "@mui/material";

interface LoadingSpinnerProps {
  text?: string;
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ 
  text = "Syncing backlog...", 
  size = 12, 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-mono text-brand-yellow font-bold uppercase tracking-widest bg-brand-yellow/10 px-3 py-1 rounded-md border border-brand-yellow/20 animate-pulse ${className}`}>
      <CircularProgress size={size} sx={{ color: "var(--color-brand-yellow)" }} />
      <span>{text}</span>
    </div>
  );
}