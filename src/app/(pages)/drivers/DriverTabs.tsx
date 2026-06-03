"use client";
import React from 'react';
import { Tabs, Tab } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

export type RankingTab = 'rating' | 'experience';

interface DriverTabsProps {
  activeTab: RankingTab;
  onTabChange: (tab: RankingTab) => void;
}

export default function DriverTabs({ activeTab, onTabChange }: DriverTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onChange={(_, newValue: RankingTab) => onTabChange(newValue)}
      aria-label="Ranking categories"
      sx={{
        '& .MuiTabs-indicator': { backgroundColor: 'var(--color-brand-yellow)' },
        '& .MuiTab-root': { 
          color: 'var(--color-brand-muted)', 
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          tracking: 'wider',
          minHeight: '40px',
          py: 1
        },
        '& .Mui-selected': { color: 'var(--color-brand-yellow) !important' },
      }}
      className="bg-brand-navy-dark/60 p-1 rounded-xl border border-brand-navy-light"
    >
      <Tab 
        icon={<EmojiEventsIcon sx={{ fontSize: '1.1rem' }} />} 
        iconPosition="start" 
        label="Rating" 
        value="rating" 
      />
      <Tab 
        icon={<MilitaryTechIcon sx={{ fontSize: '1.2rem' }} />} 
        iconPosition="start" 
        label="Experience" 
        value="experience" 
      />
    </Tabs>
  );
}