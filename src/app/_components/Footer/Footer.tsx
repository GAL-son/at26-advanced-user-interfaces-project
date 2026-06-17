"use client";

import React from "react";
import { useTranslations } from "next-intl";
import MessageIcon from "@mui/icons-material/Message";
import DnsIcon from "@mui/icons-material/Dns";
import { useKeyboardNavigation } from "@/app/_hooks/useKeyboardNavigation";
import { focusFlatSection } from "@/app/_utils/navigation";

const PAGE_ORDER = ["menu", "tournament-registration", "footer"]; // Upewnij się, że "footer" jest w Twojej tablicy podstrony

export default function Footer() {
    const t = useTranslations("Common");

    const discordLink = process.env.NEXT_PUBLIC_DISCORD_LINK;
    const serversRaw = process.env.NEXT_PUBLIC_ACSM_SERVERS_LIST || "";
    const servers = serversRaw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    // Dynamiczne obliczanie elementów do focusu:
    // Przycisk Discord (0 lub 1) + długość tablicy serwerów
    const totalFooterItems = (discordLink ? 1 : 0) + servers.length;

    const { registerItem, handleKeyDown } = useKeyboardNavigation({
        itemCount: totalFooterItems,
        orientation: "vertical", // Intuicyjne poruszanie się góra/dół po linkach
        loop: false,
        onLeave: (direction) => {
            // Zarządzanie wyjściem ze stopki (np. w górę wraca do ostatniej sekcji)
            focusFlatSection("footer", direction, PAGE_ORDER);
        },
    });

    // Licznik indeksów, aby precyzyjnie przypisać numery (0, 1, 2...) niezależnie od warunków renderu
    let currentFocusIndex = 0;

    if (!discordLink && servers.length === 0) {
        return (
            <footer 
                data-section="footer"
                className="w-full border-t border-brand-navy-light/40 bg-brand-navy-dark/10 py-6 text-center text-xs text-brand-text-muted"
            >
                <p>&copy; {new Date().getFullYear()} ACSM. {t("community.rightsReserved")}</p>
            </footer>
        );
    }

    return (
        <footer 
            data-section="footer" 
            className="w-full border-t border-brand-navy-light/40 bg-brand-navy-dark/20 mt-auto"
        >
            <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

                    {/* KOLUMNA 1: O nas / Info */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">
                            ACSM Portal
                        </h3>
                        <p className="text-xs text-brand-text-muted leading-relaxed max-w-sm">
                            {t("community.aboutText")}
                        </p>
                    </div>

                    {/* KOLUMNA 2: Społeczność (Discord) */}
                    {discordLink && (() => {
                        const index = currentFocusIndex++;
                        return (
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted opacity-80">
                                    {t("community.joinTitle")}
                                </h4>
                                <a
                                    href={discordLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={0}
                                    ref={registerItem(index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="inline-flex items-center justify-center gap-2.5 w-full max-w-xs py-2.5 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white uppercase tracking-wide transition-colors duration-200 shadow-sm focus-brand !text-nav-button font-bold text-xs focus:ring-2 focus:ring-[var(--color-brand-yellow-hover)] focus:outline-none"
                                    aria-label={t("community.discordAriaLabel")}
                                >
                                    <MessageIcon sx={{ fontSize: "1.1rem" }} />
                                    {t("community.discordBtn")}
                                </a>
                            </div>
                        );
                    })()}

                    {/* KOLUMNA 3: Serwery */}
                    {servers.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted opacity-80">
                                {t("community.serversTitle")}
                            </h4>
                            <div className="flex flex-col gap-2" role="list">
                                {servers.map((serverUrl) => {
                                    const readableName = serverUrl.replace("https://", "").replace("http://", "");
                                    const index = currentFocusIndex++; // Każdy serwer dostaje kolejny unikalny numer

                                    return (
                                        <a
                                            key={serverUrl}
                                            href={serverUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            role="listitem"
                                            tabIndex={0}
                                            ref={registerItem(index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-brand-navy-dark/50 border border-brand-navy-light/60 hover:border-brand-yellow-hover hover:bg-brand-navy-light/30 group transition-all duration-200 focus-brand focus:ring-2 focus:ring-[var(--color-brand-yellow-hover)] focus:outline-none"
                                            aria-label={t("community.serverAVEAriaLabel", { name: readableName })}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <DnsIcon className="text-brand-text-muted group-hover:text-brand-yellow-hover transition-colors text-xs" />
                                                <span className="text-brand-text truncate !text-btn-mono font-medium text-xs">
                                                    {readableName}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow-hover opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:inline">
                                                {t("community.signUp")} &rarr;
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* DOLNA BELKA: Prawa autorskie */}
                <div className="mt-8 pt-6 border-t border-brand-navy-light/20 text-center text-[11px] text-brand-text-muted">
                    <p>&copy; {new Date().getFullYear()} ACSM. {t("community.rightsReserved")}</p>
                </div>
            </div>
        </footer>
    );
}