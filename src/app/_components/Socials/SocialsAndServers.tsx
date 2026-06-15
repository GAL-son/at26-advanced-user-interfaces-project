"use client";

import React from "react";
import { useTranslations } from "next-intl";
import MessageIcon from "@mui/icons-material/Message"; // Ikona Discorda / Wiadomości
import DnsIcon from "@mui/icons-material/Dns"; // Ikona Serwera
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";

interface SocialsAndServersProps {
  onNavigateHorizontal?: (direction: "prev" | "next") => void;
  onNavigateVertical?: (direction: "up" | "down") => void;
}

interface InteractiveItem {
  id: string;
  type: "discord" | "server";
  url: string;
  readableName: string;
}

export default function SocialsAndServers({
  onNavigateHorizontal,
  onNavigateVertical,
}: SocialsAndServersProps) {
  const t = useTranslations("Home");

  // 1. Pobieranie danych z procesów środowiskowych
  const discordLink = process.env.DISCORD_LINK;
  const serversRaw = process.env.ACSM_SERVERS_LIST || "";
  const servers = serversRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Bezpiecznik: Brak danych = brak renderu
  if (!discordLink && servers.length === 0) return null;

  // 2. Budowanie tablicy wyłącznie INTERAKTYWNYCH elementów dla hooka nawigacji
  const interactiveItems: InteractiveItem[] = [];

  if (discordLink) {
  interactiveItems.push({ 
    id: "discord", 
    type: "discord", 
    url: discordLink,
    readableName: "Discord" // Dodana wymagana właściwość
  });
}

  servers.forEach((serverUrl, idx) => {
    const readableName = serverUrl.replace("https://", "").replace("http://", "");
    interactiveItems.push({
      id: `server-${idx}`,
      type: "server",
      url: serverUrl,
      readableName,
    });
  });

  // 3. Inicjalizacja hooka nawigacji klawiaturowej (układ pionowy wewnątrz sekcji)
  const { registerItem, handleKeyDown } = useKeyboardNavigation({
    itemCount: interactiveItems.length,
    orientation: "vertical",
    loop: false,
    onLeave: (direction) => {
      if (direction === "prev" || direction === "next") {
        if (onNavigateHorizontal) onNavigateHorizontal(direction);
      } else if (direction === "up" || direction === "down") {
        if (onNavigateVertical) onNavigateVertical(direction);
      }
    },
  });

  return (
    <section 
      className="w-full bg-[var(--color-brand-navy-dark)]/20 rounded-xl p-5 border border-[var(--color-brand-navy-light)]/40 flex flex-col gap-5 animate-fadeIn focus:outline-none"
      aria-label={t("community.ariaLabel")}
    >
      {/* --- SEKCJA DISCORDA --- */}
      {discordLink && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            {t("community.joinTitle")}
          </h3>
          {(() => {
            const itemIndex = interactiveItems.findIndex((item) => item.id === "discord");
            return (
              <a
                href={discordLink}
                target="_blank"
                rel="noopener noreferrer"
                ref={registerItem(itemIndex)}
                onKeyDown={(e) => handleKeyDown(e, itemIndex)}
                tabIndex={0}
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm tracking-wide uppercase transition-colors duration-200 shadow-md focus-brand"
                aria-label={t("community.discordAriaLabel")}
              >
                <MessageIcon sx={{ fontSize: "1.3rem" }} />
                {t("community.discordBtn")}
              </a>
            );
          })()}
        </div>
      )}

      {/* --- SEKCJA SERWERÓW ACSM --- */}
      {servers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            {t("community.serversTitle")}
          </h3>
          <div className="flex flex-col gap-2" role="list">
            {interactiveItems
              .filter((item) => item.type === "server")
              .map((item) => {
                const itemIndex = interactiveItems.findIndex((i) => i.id === item.id);

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="listitem"
                    ref={registerItem(itemIndex)}
                    onKeyDown={(e) => handleKeyDown(e, itemIndex)}
                    tabIndex={0}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] hover:border-[var(--color-brand-yellow-hover)] hover:bg-[var(--color-brand-navy-light)]/40 group transition-all duration-200 focus-brand"
                    aria-label={t("community.serverAriaLabel", { name: item.readableName })}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DnsIcon className="text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors text-sm sm:text-base" />
                      <span className="font-mono text-xs sm:text-sm text-[var(--color-brand-text)] truncate">
                        {item.readableName}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-yellow-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:inline">
                      {t("community.signUp")} &rarr;
                    </span>
                  </a>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
}