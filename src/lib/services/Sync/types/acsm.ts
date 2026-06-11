export interface ACSMRaceResult {
  Cars: {
    Driver: {
      Guid: string;
      GuidsList: string[];
      Name: string;
    };
    Model: string;
    MinPing: number;
    MaxPing: number;
  }[];
  Result: {
    BestLap: number;
    DriverGuid: string;
    DriverName: string;
    TotalTime: number;
    NumLaps: number;
    HasPenalty: boolean;
    PenaltyTime: number;
    LapPenalty: number;
    GridPosition: number;
  }[];
  TrackConfig: string;
  TrackName: string;
  Date: string;
  SessionConfig: {
    time: number;
    laps: number;
  };
  EventName: string;
}

export interface ACSMEvent {
  id?: string;
  track: string;
  date: string;
  session_type: string;
  results_json_url: string;
}

export interface ACSMEventList {
  results: ACSMEvent[];
  num_pages: number;
}