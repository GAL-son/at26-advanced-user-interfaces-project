export interface ChampionshipListItemDto {
  id: string;
  name: string;
}

export interface ChampionshipEventDto {
    id: string; 
    name: string;
    track: string; 
    date: Date; 
    server: string;
}

export interface ChampionshipDto {
  name: string,
  events: ChampionshipEventDto[];
  from: Date,
  to:Date
}