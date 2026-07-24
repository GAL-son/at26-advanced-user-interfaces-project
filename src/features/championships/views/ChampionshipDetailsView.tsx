
import { getTranslations } from "next-intl/server";

import DynamicGrid from "@/app/_components/Common/DynamicGrid";
import BackButton from "@/components/common/BackButton";

import type { ChampionshipDto } from "../championships.types";
import EventCard from "../components/EventCard";
import ChampionshipDetails from "../components/details/ChampionshipDetails";

interface Props {
  championship: ChampionshipDto;
  searchParams: { search?: string };
}

const SECTION_ORDER = [
  "menu",
  "championship-back",
  "event-list",
  "footer"
];

export default async function ChampionshipDetailsView({ championship }: Props) {
  const t = await getTranslations("Championships");

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[var(--color-brand-navy)] text-[var(--color-brand-text)] transition-colors duration-300">
      <main className="max-w-5xl mx-auto">
        <div
          data-section="championship-back"
          data-section-page-start="true"
          className="flex items-center gap-4 mb-6"
        >
          <BackButton
            fallbackHref="/championships"
            ariaLabel={t("profile.backToChampionships")}
            sectionName="championship-back"
            sectionOrder={SECTION_ORDER}
          />    
          <span
            aria-hidden="true"
            className="!text-btn-mono uppercase select-none text-xs text-[var(--color-brand-text-muted)]"
          >
            {t("backButton")}
          </span>
        </div>

        <ChampionshipDetails name={championship.name}/>        

        <section aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="text-xl sm:text-2xl font-display font-bold uppercase mb-6 flex items-center gap-4 text-[var(--color-brand-text)]">
            {t("championship.schedule") || "Harmonogram wyścigów"}
            <span className="h-[1px] flex-1 bg-[var(--color-brand-navy-light)]/30"></span>
          </h2>

          <DynamicGrid>
            {championship.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </DynamicGrid>
        </section>
      </main>
    </div>
  );
}