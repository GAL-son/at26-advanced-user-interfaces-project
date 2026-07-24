export interface DriverRatingHistoryGroupDto {
    guid: string;
    name: string;
    data: DriverRatingPointDto[];
}

export interface DriverRatingHistoryResponseDto {
    data: DriverRatingHistoryGroupDto[];
    hasMore: boolean;
    nextPage: number | null;
}

export interface DriverRatingPointDto {
    eventId: string;
    eventName: string;
    eventDate: string;
    hasRaced: boolean;
    id: string | null;
    elo: number;
    eloChange: number;
    combo: number;
    erosion: number;
}
