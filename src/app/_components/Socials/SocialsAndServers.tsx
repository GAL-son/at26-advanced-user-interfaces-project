"use client";

import React from "react";
import { useTranslations } from "next-intl";
import MessageIcon from "@mui/icons-material/Message";
import DnsIcon from "@mui/icons-material/Dns";

export default function Footer() {
  const t = useTranslations("Home");

  const discordLink = process.env.DISCORD_LINK;
  const serversRaw = process.env.ACSM_SERVERS_LIST || "";
  const servers = serversRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Stopka zwraca pusty element, jeśli nie ma linków, ale zazwyczaj warto zostawić choćby prawa autorskie
  if (!discordLink && servers.length === 0) {
    return (
      <footer className="w-full border-t border-brand-navy-light/40 bg-brand-navy-dark/10 py-6 text-center text-xs text-brand-text-muted">
        <p>&copy; {new Date().getFullYear()} ACSM. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-brand-navy-light/40 bg-brand-navy-dark/20 mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* KOLUMNA 1: O nas / Info */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">
              ACSM Portal
            </h3>
            <p className="text-xs text-brand-text-muted leading-relaxed max-w-sm">
              {/* Tutaj możesz dodać krótki opis lub pociągnąć z tłumaczeń */}
              Dołącz do naszej społeczności simracingowej, śledź statystyki kierowców i bierz udział w ekscytujących wydarzeniach.
            </p>
          </div>

          {/* KOLUMNA 2: Społeczność (Discord) */}
          {discordLink && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted opacity-80">
                {t("community.joinTitle")}
              </h4>
              <a
                href={discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full max-w-xs py-2.5 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white uppercase tracking-wide transition-colors duration-200 shadow-sm focus-brand !text-nav-button font-bold text-xs"
                aria-label={t("community.discordAriaLabel")}
              >
                <MessageIcon sx={{ fontSize: "1.1rem" }} />
                {t("community.discordBtn")}
              </a>
            </div>
          )}

          {/* KOLUMNA 3: Serwery */}
          {servers.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted opacity-80">
                {t("community.serversTitle")}
              </h4>
              <div className="flex flex-col gap-2" role="list">
                {servers.map((serverUrl, idx) => {
                  const readableName = serverUrl.replace("https://", "").replace("http://", "");
                  return (
                    <a
                      key={idx}
                      href={serverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="listitem"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-brand-navy-dark/50 border border-brand-navy-light/60 hover:border-brand-yellow-hover hover:bg-brand-navy-light/30 group transition-all duration-200 focus-brand"
                      aria-label={t("community.serverAriaLabel", { name: readableName })}
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
          <p>&copy; {new Date().getFullYear()} ACSM. {t("community.ariaLabel") || "Wszelkie prawa zastrzeżone."}</p>
        </div>
      </div>
    </footer>
  );
}