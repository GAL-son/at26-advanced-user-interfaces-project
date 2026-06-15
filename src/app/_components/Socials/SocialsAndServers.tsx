import React from "react";
import MessageIcon from "@mui/icons-material/Message"; // Ikona Discorda / Wiadomości
import DnsIcon from "@mui/icons-material/Dns"; // Ikona Serwera

export default function SocialsAndServers() {
  // Pobieramy link do Discorda z procesów środowiskowych serwera
  const discordLink = process.env.DISCORD_LINK;

  // Pobieramy listę serwerów i rozbijamy ją po przecinku na tablicę, czyszcząc białe znaki
  const serversRaw = process.env.ACSM_SERVERS_LIST || "";
  const servers = serversRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Jeśli brak linków i brak serwerów, nie renderujemy pustego klocka
  if (!discordLink && servers.length === 0) return null;

  return (
    <section 
      className="w-full mt-6 bg-[var(--color-brand-navy-dark)]/20 rounded-xl p-5 border border-[var(--color-brand-navy-light)]/40 flex flex-col gap-5 animate-fadeIn"
      aria-label="Nasza społeczność i serwery"
    >
      {/* --- SEKCJA DISCORDA --- */}
      {discordLink && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            Dołącz do Społeczności
          </h3>
          <a
            href={discordLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm tracking-wide uppercase transition-colors duration-200 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
            aria-label="Dołącz do naszego serwera Discord (otwiera się w nowej karcie)"
          >
            <MessageIcon sx={{ fontSize: "1.3rem" }} />
            Serwer Discord
          </a>
        </div>
      )}

      {/* --- SEKCJA SERWERÓW ACSM --- */}
      {servers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text-muted)] opacity-80">
            Nasze Serwery AC
          </h3>
          <div className="flex flex-col gap-2" role="list">
            {servers.map((serverUrl, index) => {
              // Czyścimy url na ładną nazwę dla użytkownika (np. acsm.twojadomena.pl)
              const readableName = serverUrl
                .replace("https://", "")
                .replace("http://", "");

              return (
                <a
                  key={`${serverUrl}-${index}`}
                  href={serverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-brand-navy-dark)] border border-[var(--color-brand-navy-light)] hover:border-[var(--color-brand-yellow-hover)] hover:bg-[var(--color-brand-navy-light)]/40 group transition-all duration-200"
                  aria-label={`Przejdź do serwera ${readableName} (otwiera się w nowej karcie)`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <DnsIcon className="text-[var(--color-brand-text-muted)] group-hover:text-[var(--color-brand-yellow-hover)] transition-colors text-sm sm:text-base" />
                    <span className="font-mono text-xs sm:text-sm text-[var(--color-brand-text)] truncate">
                      {readableName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-yellow-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:inline">
                    Zapisz się &rarr;
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