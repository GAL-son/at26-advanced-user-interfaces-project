export interface RaceResultSummaryDto {
    finish: number | null;
    positionChange: number | null;
}

export interface DriverEventSummaryDto {
    driverGuid: string;
    driverName: string;
    car: string,
    quali: {
        finish: number | null;
    } | null;
    races: RaceResultSummaryDto[];
    rating: {
        after: number;
        change: number;
    } | null;
}

export interface EventDetailsDto {
    id: string;
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    stats: {
        racesCount: number;
        uniqueDriversCount: number;
    };
    results: DriverEventSummaryDto[];
    sessions: {
        date: Date;
        type: string;
        durationLaps: number | null;
        durationMinutes: number | null;
        results: {
            driverGuid: string;
            driverName: string;
            start: number | null;
            finish: number | null;
            laps: number;
            totalTime: number;
            bestLap: number;
            gap: number | null;
        }[];
    }[];
}

export interface EventDto {
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    sessions: SessionDto[];
}

export interface SessionDto {
    id: string;
    date: Date;
    type: string;
    durationLaps: number | null;
    durationMinutes: number | null;
    results: ResultDto[];
}

export interface ResultDto {
    driverGuid: string;
    driverName: string; // Spłaszczone pole z Driver.mainName
    start: number | null;
    finish: number | null;
    car: string;
    laps: number;
    totalTime: number;
    bestLap: number;
    gap: number | null;
}

export interface EventListDto {
    id: string,
    name: string;
    championshipId: string | null;
    track: string;
    date: Date;
    server: string;
    sessions: SessionDto[];
}