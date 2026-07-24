"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Trophy, Award, ArrowDownAZ, Clock } from "lucide-react";
import Tabs, { TabItem } from "@/app/_components/Common/Tabs";
import { DriverSortOption } from "@/lib/services/drivers.service";

interface DriverOrderTabsProps {
  sortBy: DriverSortOption;
  setSortBy: (val: DriverSortOption) => void;
  ariaLabel?: string;
  onNavigateVertical: (direction: "up" | "down") => void;
}

export default function DriverOrderTabs({
  sortBy,
  setSortBy,
  ariaLabel,
  onNavigateVertical,
}: DriverOrderTabsProps) {
  const t = useTranslations("Drivers");

  const tabsConfig: TabItem<DriverSortOption>[] = [
    { value: "RATING_DESC", label: t("tabs.rating"), icon: <Trophy className="w-4 h-4" /> },
    { value: "BEST_RATING_DESC", label: t("tabs.bestRating"), icon: <Award className="w-4 h-4" /> },
    { value: "NAME_ASC", label: t("tabs.alphabetical"), icon: <ArrowDownAZ className="w-4 h-4" /> },
    { value: "LAST_ACTIVE_DESC", label: t("tabs.lastActive"), icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <Tabs
      items={tabsConfig}
      value={sortBy}
      onChange={setSortBy}
      ariaLabel={ariaLabel}
      variant="grid"
      onNavigateVertical={onNavigateVertical}
      onLeaveNext={() => {
        const searchInput = document.getElementById("driver-search-container")?.querySelector("input");
        searchInput?.focus();
      }}
    />
  );
}