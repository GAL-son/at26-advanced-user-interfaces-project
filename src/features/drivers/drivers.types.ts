export interface DriverBasicDto {
    guid: string;
    mainName: string;
    currentRating: number;
}

export interface DriverDetailsDto {
    guid: string;
    mainName: string;
    altNames: string | null;
    currentRating: number;
    bestRating: number;
    combo: number;
    erosion: number;
    joined: Date;
    lastActive: Date | null;
    stats: {
        eventsCount: number;
        avgQualiPosition: number | null;
        avgFinishPosition: number | null;
        avgPositionsGained: number | null;
    };
}

export type DriverSortOption =
    | 'NAME_ASC'
    | 'NAME_DESC'
    | 'RATING_DESC'
    | 'RATING_ASC'
    | 'BEST_RATING_DESC'
    | 'BEST_RATING_ASC'
    | 'LAST_ACTIVE_DESC';

export interface DriverListItemDto {
    guid: string;
    mainName: string;
    altNames: string | null;
    currentRating: number;
    bestRating: number;
    combo: number;
    erosion: number;
    lastActive: Date | null;
}

export interface FormattedDriver extends DriverListItemDto {
    position: number;
}

export interface PaginatedDriversResult {
    drivers: DriverListItemDto[];
    nextSkip: number | null;
    hasMore: boolean;
}
