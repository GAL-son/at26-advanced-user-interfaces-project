export interface Event {
    name: string; 
    id: string; 
    championshipId: string | null; 
    track: string; 
    date: Date; 
    server: string;
}