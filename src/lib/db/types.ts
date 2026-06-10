// src/lib/db/types.ts

export class Driver {
  guid: string;
  mainName: string;
  altNames?: string | null; // Prisma zwraca string | null
  currentElo: number;
  combo: number;

  constructor(guid: string, mainName: string, altNames?: string | null, currentElo = 1000.0, combo = 0) {
    this.guid = guid;
    this.mainName = mainName;
    this.altNames = altNames;
    this.currentElo = currentElo;
    this.combo = combo;
  }
}

export class Event {
  id: string;
  name: string;
  track: string;
  date: Date;
  laps?: number;
  time?: number;
  server: string;
  processed: boolean;
  raceResults: RaceResult[]; // Zmiana na tablicę i nazwę mnogą

  constructor(
    id: string, 
    name: string, 
    track: string, 
    date: Date, 
    server: string, 
    processed = false, 
    laps?: number, 
    time?: number, 
    raceResults: RaceResult[] = [] // Inicjalizacja pustą tablicą
  ) {
    this.id = id;
    this.name = name;
    this.track = track;
    this.date = date;
    this.laps = laps;
    this.time = time;
    this.server = server;
    this.processed = processed;
    this.raceResults = raceResults;
  }
}

export interface RaceResultProps {
    id?: string; 
    eventId: string;
    driverGuid: string;
    started: number;
    position: number;
    car: string;
    laps: number;
    totalTime: number;
    bestLap: number;
    gap?: string | null;
    eloBefore?: number | null;
    eloAfter?: number | null;
    combo?: number | null;
    eloAlg?: string | null;
    createdAt?: Date;

    event?: Event;
    driver?: Driver;
}

export class RaceResult {
    id?: string;
    eventId: string;
    driverGuid: string;
    started: number;
    position: number;
    car: string;
    laps: number;
    totalTime: number;
    bestLap: number;
    gap: string | null;
    eloBefore: number | null;
    eloAfter: number | null;
    combo: number | null;
    eloAlg: string | null;
    createdAt: Date;

    event?: Event;
    driver?: Driver;

    constructor(props: RaceResultProps) {
        this.id = props.id;
        this.eventId = props.eventId;
        this.driverGuid = props.driverGuid;
        this.started = props.started;
        this.position = props.position;
        this.car = props.car;
        this.laps = props.laps;
        this.totalTime = props.totalTime;
        this.bestLap = props.bestLap;

        this.gap = props.gap ?? null;
        this.eloBefore = props.eloBefore ?? null;
        this.eloAfter = props.eloAfter ?? null;
        this.combo = props.combo ?? 0;
        this.eloAlg = props.eloAlg ?? null;
        this.createdAt = props.createdAt ?? new Date();

        // Przypisanie relacji, jeśli istnieją
        if (props.event) this.event = props.event;
        if (props.driver) this.driver = props.driver;
    }
    
    /**
     * Zwraca informację o ile pozycji kierowca awansował (lub spadł, jeśli wynik ujemny)
     */
    get positionsGained(): number {
        return this.started - this.position;
    }

    /**
     * Zwraca zmianę punktów ELO po tym wyścigu
     */
    get eloChange(): number | null {
        if (this.eloBefore !== null && this.eloAfter !== null) {
            return this.eloAfter - this.eloBefore;
        }
        return null;
    }
}