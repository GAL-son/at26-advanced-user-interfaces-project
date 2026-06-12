export interface EventDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  guid: string;
  color: string;
}

export default function EventDot({
  cx,
  cy,
  payload,
  guid,
  color,
}: EventDotProps) {
  // Bezpieczna ochrona przed niezainicjalizowanymi danymi z Recharts
  if (!payload || cx === undefined || cy === undefined) return null;

  const meta = payload[`meta_${guid}`];

  // Jeśli kierowca nie jechał w tym wyścigu, nie renderujemy punktu na osi czasu
  if (!meta || !meta.hasRaced) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill="var(--color-brand-navy-dark)" // Wypełnienie idealnie pasuje do tła karty (tryb jasny/ciemny)
      stroke={color}
      strokeWidth={2}
      style={{
        transition: "stroke 0.3s ease", // Płynne przejście koloru ramki przy zmianie motywu
      }}
    />
  );
}
