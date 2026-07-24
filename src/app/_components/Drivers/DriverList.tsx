"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DriverRow, { FormattedDriver } from "./DriverRow";
import DriverRowMobile from "./DriverRowMobile";
import InfiniteScrollList, { FetchDataResponse } from "@/app/_components/Common/InfiniteScrollList";
import { getDriversListAction } from "@/actions/drivers.actions";
import { DriverSortOption } from "@/lib/services/drivers.service";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

interface DriverListProps {
  initialDrivers: FormattedDriver[];
  initialHasMore: boolean;
  searchQuery?: string;
  sortBy?: DriverSortOption;
  limit?: number;
}

export default function DriverList({
  initialDrivers,
  initialHasMore,
  searchQuery = "",
  sortBy = "RATING_DESC",
  limit = 20,
}: DriverListProps) {
  const t = useTranslations("Drivers");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: initialDrivers.length,
    orientation: "vertical",
    loop: false,
  });

  const fetchDriversAdapter = async (
    skip: number,
    take: number,
    search?: string
  ): Promise<FetchDataResponse<FormattedDriver>> => {
    try {
      const res = await getDriversListAction(skip, take, search, sortBy);

      const formattedData: FormattedDriver[] = res.drivers.map((d, index) => ({
        ...d,
        position: skip + index + 1,
      }));

      return {
        success: true,
        data: formattedData,
        hasMore: res.hasMore,
      };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        hasMore: false,
        error: err.message || t("list.errors.fetchFailed"),
      };
    }
  };

  const headerClass = "font-bold text-xs uppercase tracking-wider font-sans text-[var(--color-brand-text-muted)]";

  // Określenie kolumn dla nagłówka
  const isRatingSort = sortBy === "RATING_DESC" || sortBy === "RATING_ASC";
  const isBestRatingSort = sortBy === "BEST_RATING_DESC" || sortBy === "BEST_RATING_ASC";
  const isFullColumns = !isRatingSort && !isBestRatingSort;

  const showPosition = isRatingSort || isBestRatingSort;

  const headerGridClass = showPosition 
    ? "grid-cols-[64px_1fr_176px_144px]" 
    : "grid-cols-[1fr_144px_176px_144px]";

  return (
    <div 
      className="w-full bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] rounded-[var(--radius-brand-card)] overflow-hidden shadow-xl"
      role="grid"
      aria-label={t("list.ariaLabel")}
    >
      {/* Nagłówek Grid */}
      {!isMobile && (
        <div 
          role="row"
          className={`grid ${headerGridClass} items-center py-3 bg-[color-mix(in_srgb,var(--color-brand-text)_3%,var(--color-brand-navy-dark))] border-b border-[var(--color-brand-navy-light)]`}
        >
          {/* Pozycja - Wycentrowana */}
          {showPosition && (
            <div role="columnheader" className={`${headerClass} text-center`}>
              {t("list.headers.pos")}
            </div>
          )}

          {/* Profil kierowcy - Domyślne wyrównanie do lewej */}
          <div role="columnheader" className={`${headerClass} pl-4`}>
            {t("list.headers.profile")}
          </div>

          {/* Best Rating - Wycentrowane */}
          {(isBestRatingSort || isFullColumns) && (
            <div role="columnheader" className={`${headerClass} text-center`}>
              {t("list.headers.bestRating")}
            </div>
          )}

          {/* Last Active - Wycentrowane */}
          <div role="columnheader" className={`${headerClass} text-center`}>
            {t("list.headers.lastActive")}
          </div>

          {/* ELO / Current Rating - Wycentrowane */}
          {(isRatingSort || isFullColumns) && (
            <div role="columnheader" className={`${headerClass} text-center`}>
              {t("list.headers.elo")}
            </div>
          )}
        </div>
      )}

      {/* Kontener listy elementów */}
      <InfiniteScrollList<FormattedDriver>
        containerAs="div"
        containerClassName="w-full"
        initialItems={initialDrivers}
        initialHasMore={initialHasMore}
        searchQuery={searchQuery}
        limit={limit}
        fetchDataAction={fetchDriversAdapter}
        getKey={(driver) => driver.guid}
        emptyStateText={t("list.noDrivers")}
        loadingMoreText={t("list.loadingMore")}
        renderItem={(driver, index) => {
          const keyProps = {
            driver,
            index,
            sortBy,
            onKeyDown: handleKeyDown,
            registerRef: registerItem(index),
            transition: { duration: 0.2, delay: (index % limit) * 0.03 },
          };

          return isMobile ? (
            <DriverRowMobile key={driver.guid} {...keyProps} />
          ) : (
            <DriverRow key={driver.guid} {...keyProps} />
          );
        }}
      />
    </div>
  );
}