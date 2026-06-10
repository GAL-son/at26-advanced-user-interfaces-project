// src/models/racing.ts

import { 
  Event as PrismaEvent, 
  RaceResult as PrismaRaceResult, 
  Driver as PrismaDriver 
} from '@prisma/client';

// Typ dla pełnego wyniku z bazy (wynik + kierowca)
type PrismaRaceResultWithDriver = PrismaRaceResult & {
  driver: PrismaDriver;
};

// Typ dla pełnego eventu z bazy (event + wyniki + kierowcy)
type PrismaEventFull = PrismaEvent & {
  raceResult: PrismaRaceResultWithDriver[];
};

export class Driver {
  guid: string;
  mainName: string;
  altNames: string | null;

  constructor(guid: string, mainName: string, altNames: string | null) {
    this.guid = guid;
    this.mainName = mainName;
    this.altNames = altNames;
  }

  // Fabryka dla Drivera
  static fromPrisma(dbDriver: PrismaDriver): Driver {
    return new Driver(
      dbDriver.guid,
      dbDriver.mainName,
      dbDriver.altNames
    );
  }
}

export class RaceResult {
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
  driver?: Driver;

  constructor(dbResult: PrismaRaceResult, driverInstance?: Driver) {
    this.started = dbResult.started;
    this.position = dbResult.position;
    this.car = dbResult.car;
    this.laps = dbResult.laps;
    this.totalTime = dbResult.totalTime;
    this.bestLap = dbResult.bestLap;
    this.gap = dbResult.gap;
    this.eloBefore = dbResult.eloBefore;
    this.eloAfter = dbResult.eloAfter;
    this.combo = dbResult.combo;
    this.eloAlg = dbResult.eloAlg;
    this.driver = driverInstance;
  }

  // Fabryka dla RaceResult
  static fromPrisma(dbResult: PrismaRaceResultWithDriver): RaceResult {
    const driverInstance = Driver.fromPrisma(dbResult.driver);
    return new RaceResult(dbResult, driverInstance);
  }

  get positionsGained(): number {
    return this.started - this.position;
  }

  get eloChange(): number | null {
    if (this.eloBefore !== null && this.eloAfter !== null) {
      return this.eloAfter - this.eloBefore;
    }
    return null;
  }
}

export class Event {
  name: string;
  track: string;
  date: Date;
  laps: number | null;
  time: number | null;
  server: string;
  processed: boolean;
  raceResults: RaceResult[];

  constructor(dbEvent: PrismaEvent, raceResults: RaceResult[] = []) {
    this.name = dbEvent.name;
    this.track = dbEvent.track;
    this.date = dbEvent.date;
    this.laps = dbEvent.laps;
    this.time = dbEvent.time;
    this.server = dbEvent.server;
    this.processed = dbEvent.processed;
    this.raceResults = raceResults;
  }

  static fromPrisma(dbEvent: PrismaEventFull): Event {
    const resultsInstances = dbEvent.raceResult.map(result => RaceResult.fromPrisma(result));
    return new Event(dbEvent, resultsInstances);
  }
}