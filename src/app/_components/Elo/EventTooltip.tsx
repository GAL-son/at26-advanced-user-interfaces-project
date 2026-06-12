import ComboBadge from "./ComboBadge";

export interface EventTooltipProps {
    active: boolean;
    payload: any[];
    guids: string[];
}

export default function EventTooltip({ active, payload, guids }: EventTooltipProps) {
  if (active && payload && payload.length) {
    const rawData = payload[0].payload;

    return (
      <div className="bg-brand-navy-dark border border-brand-navy-light p-3 rounded-lg shadow-2xl font-mono text-xs min-w-[220px] z-[100]">
        <p className="text-brand-muted/70 mb-2 font-bold border-b border-b-brand-navy-light/40 pb-1 text-center truncate max-w-[240px]">
          {rawData.eventName}
        </p>

        <div className="flex flex-col gap-2">
          {guids.map((guid: string) => {
            const elo = rawData[`elo_${guid}`];
            const meta = rawData[`meta_${guid}`];

            if (elo === undefined || !meta) return null;

            const isGain = meta.eloChange >= 0;

            return (
              <div key={guid} className="flex flex-col border-l-2 pl-2" style={{ borderColor: meta.color }}>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-200 font-bold truncate max-w-[115px]">{meta.driverName}</span>
                    {meta.combo > 1 && <ComboBadge combo={meta.combo} />}
                  </div>
                  <span className="text-slate-100 font-black text-right whitespace-nowrap">{elo} ELO</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`${meta.hasRaced ? 'text-brand-muted/50' : 'text-amber-500/60 font-semibold'}`}>
                    {meta.hasRaced ? "🔴 Participated" : "⚪ Skipped (Static)"}
                  </span>
                  {meta.hasRaced && (
                    <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {isGain ? `+${meta.eloChange}` : meta.eloChange}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}