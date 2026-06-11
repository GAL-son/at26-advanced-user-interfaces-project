export type ACSMEvent = {
  track: string;
  track_layout: string;
  session_type: 'PRACTICE' | 'QUALIFY' | 'RACE' | string;
  date: string;
  results_json_url: string;
  results_page_url: string;
};

export type ACSMApiResponse = {
    results: ACSMEvent[] | null;
    num_pages: number;
};

