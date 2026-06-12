export interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  guid: string;
  color: string;
  isMobile?: boolean; // Nowy prop odbierany z rodzica
}

export default function EventDot({
  cx,
  cy,
  payload,
  guid,
  color,
  isMobile = false,
}: EventDotProps) {
  if (!payload || cx === undefined || cy === undefined) return null;

  const meta = payload[`meta_${guid}`];

  if (!meta || !meta.hasRaced) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      // POPRAWKA: Rozmiar promienia kropki na podstawie urządzenia
      r={isMobile ? 5 : 3.5}
      fill="var(--color-brand-navy-dark)"
      stroke={color}
      // POPRAWKA: Grubsza linia ramki (stroke) na mobilce dla lepszej widoczności
      strokeWidth={isMobile ? 2.5 : 2}
      style={{
        transition: "stroke 0.3s ease",
      }}
    />
  );
}