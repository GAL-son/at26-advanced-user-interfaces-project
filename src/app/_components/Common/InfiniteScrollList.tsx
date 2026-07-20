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
  searchQuery: string;
  limit: number;

  fetchDataAction: (skip: number, limit: number, search?: string) => Promise<FetchDataResponse<T>>;
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string | number;
}

export default function InfiniteScrollList<T>({
  initialItems,
  initialHasMore,
  searchQuery,
  limit,
  fetchDataAction,
  renderItem,
  getKey,
}: InfiniteScrollListProps<T>) {
  const t = useTranslations("Events");

  const [items, setItems] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Synchronizacja przy zmianie filtrów z góry (np. nowe wyszukiwanie resetuje listę)
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

  return (
    <div className="space-y-6 relative pb-12">
      {items.length === 0 && !loadingMore ? (
        <p role="status" className="text-center py-12 font-medium text-[var(--color-brand-text-muted)]">
          {t("list.emptyState")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.li
                key={getKey(item)}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {renderItem(item)}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {error && (
        <div role="alert" className="mt-4 p-4 font-medium rounded-[var(--radius-brand-card)] border border-[color-mix(in_srgb,var(--color-elo-loss)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-elo-loss)_10%,transparent)] text-[var(--color-elo-loss)]">
          {error}
        </div>
      )}

      <div ref={loaderRef} className="mt-4" aria-busy={loadingMore}>
        {hasMore && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="h-32 rounded-[var(--radius-brand-card)] bg-[color-mix(in_srgb,var(--color-brand-navy-light)_30%,transparent)] border border-[var(--color-brand-navy-light)]"
              />
            ))}
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <p role="status" className="text-center py-8 font-mono text-xs uppercase tracking-widest font-bold text-[var(--color-brand-text-muted)] opacity-50">
            {t("list.endOfGrid")}
          </p>
        )}
      </div>
    </div>
  );
}