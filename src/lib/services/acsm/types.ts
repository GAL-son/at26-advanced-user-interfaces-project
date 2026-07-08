export interface AcsmChampionshipInfo {
  id: string;
  name: string;
}

export interface AcsmChampionshipList {
  championships: AcsmChampionshipInfo[]
}

export enum AcsmSessionType {
  RACE = "RACE",
  QUALIFY = "QUALIFY",
  PRACTICE = "PRACTICE"
}

export interface AcsmEvent {
  id?: string;
  track: string;
  date: string;
  session_type: AcsmSessionType;
  results_json_url: string;
  server?: string
}

export interface AcsmEventList {
  results: AcsmEvent[];
  num_pages: number;
}

export interface AcsmDriverResult {
  DriverGuid: string,
  DriverName: string,
  CarModel: string,
  BallastKg: number,
  Restrictor: number,
  GridPosition: number,
  TotalTime: number,
  NumLaps: number,
  PenaltyTime: number,
  BestLap: number
}

export interface AcsmRaceResult {
  EventName: string,
  ChampionshipID: string,
  Date: string,
  Type: AcsmSessionType,
  TrackName: string,
  TrackConfig: string,
  SessionConfig: {
    time: number,
    laps: number,
  },
  Result: AcsmDriverResult[]
}

