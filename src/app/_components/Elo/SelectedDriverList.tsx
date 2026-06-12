import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface DriverBasicInfo {
  guid: string;
  mainName: string;
  currentElo?: number;
}

// 🟢 WYDZIELONY SUBKOMPONENT DLA LISTY WYBRANYCH KIEROWCÓW
interface SelectedDriversListProps {
  drivers: DriverBasicInfo[];
  onRemove: (guid: string) => void;
}

export default function SelectedDriversList({ drivers, onRemove }: SelectedDriversListProps) {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted font-bold mb-3">
        Currently Comparing
      </p>
      <div className="flex flex-wrap gap-2">
        {drivers.length === 0 ? (
          <p className="text-xs text-brand-text-muted/60 font-mono italic">
            No drivers selected. Use the search bar above to populate
            telemetry.
          </p>
        ) : (
          drivers.map((driver) => (
            <Chip
              key={driver.guid}
              label={`${driver.mainName} ${driver.currentElo ? `(${driver.currentElo})` : ""}`}
              onDelete={() => onRemove(driver.guid)}
              deleteIcon={
                <CloseIcon className="!text-brand-text-muted hover:!text-brand-yellow" />
              }
              className="!bg-brand-navy !text-brand-text !border !border-brand-navy-light font-mono text-xs uppercase !p-1"
            />
          ))
        )}
      </div>
    </div>
  );
}
