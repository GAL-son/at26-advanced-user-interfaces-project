"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export interface FetchDataResponse<T> {
  success: boolean;
  data: T[];
  hasMore: boolean;
  error?: string;
}

interface InfiniteScrollListProps<T> {
  initialItems: T[];
  initialHasMore: boolean;
  searchQuery?: string;
  limit?: number;

  fetchDataAction: (skip: number, limit: number, search?: string) => Promise<FetchDataResponse<T>>;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T) => string | number;
  
  /** Dozwolone kontenery HTML dla listy */
  containerAs?: "ul" | "tbody" | "div";
  /** Klasy CSS dla kontenera - domyślnie siatka 1/2/3 kolumn */
  containerClassName?: string;
  emptyStateText?: string;
  loadingMoreText?: string;
}

export default function InfiniteScrollList<T>({
  initialItems,
  initialHasMore,
  searchQuery = "",
  limit = 20,
  fetchDataAction,
  renderItem,
  getKey,
  containerAs = "ul",
  containerClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4",
  emptyStateText,
  loadingMoreText,
}: InfiniteScrollListProps<T>) {
  const t = useTranslations("Common");

  const [items, setItems] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
  }, [initialItems, initialHasMore]);

  const loadMoreItems = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const res = await fetchDataAction(items.length, limit, searchQuery);

      if (res.success) {
        setItems((prev) => [...prev, ...res.data]);
        setHasMore(res.hasMore);
      } else {
        throw new Error(res.error || t("errors.unexpected"));
      }
    } catch (err: any) {
      setError(err.message || t("errors.loadMoreFailed"));
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, limit, searchQuery, hasMore, loadingMore, fetchDataAction, t]);

  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreItems();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMoreItems]);

  const ContainerComponent = containerAs;

  return (
    <div className="space-y-4 relative pb-12 w-full">
      {items.length === 0 && !loadingMore ? (
        <div role="status" className="text-center py-12 font-medium text-[var(--color-brand-text-muted)] font-sans">
          {emptyStateText || t("list.emptyState")}
        </div>
      ) : (
        <ContainerComponent className={containerClassName}>
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <React.Fragment key={getKey(item)}>
                {renderItem(item, index)}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </ContainerComponent>
      )}

      {error && (
        <div role="alert" className="mt-4 p-4 font-medium rounded-[var(--radius-brand-card)] border border-[color-mix(in_srgb,var(--color-elo-loss)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-elo-loss)_10%,transparent)] text-[var(--color-elo-loss)] font-sans">
          {error}
        </div>
      )}

      <div ref={loaderRef} className="mt-4 w-full" aria-busy={loadingMore}>
        {loadingMore && (
          <div className="py-6 text-center text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-brand-text-muted)] animate-pulse">
            {loadingMoreText || t("list.loadingMore")}
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <p role="status" className="text-center py-6 font-mono text-xs uppercase tracking-widest font-bold text-[var(--color-brand-text-muted)] opacity-50">
            {t("list.terminalReached")}
          </p>
        )}
      </div>
    </div>
  );
}