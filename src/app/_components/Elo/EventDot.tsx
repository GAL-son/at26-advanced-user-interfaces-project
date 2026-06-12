export interface EventDotProps {
    cx: number;
    cy: number;
    payload: any;
    guid: string;
    color: string;
}

export default function EventDot({ cx, cy, payload, guid, color }: EventDotProps) {
  const meta = payload[`meta_${guid}`];

  if (!meta || !meta.hasRaced) return null;

  return (
    <circle cx={cx} cy={cy} r={3.5} fill="var(--color-brand-navy-dark)" stroke={color} strokeWidth={2} />
  );
}