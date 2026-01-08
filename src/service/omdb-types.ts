export interface MovieSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface SearchResponse {
  Search?: MovieSearchResult[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface MovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Plot: string;
  imdbID: string;
}

export interface OmdbRating {
  Source: string;
  Value: string;
}

/**
 * OMDb "by id/title" response shape (subset; OMDb may include additional fields).
 * Notes:
 * - "N/A" is commonly returned for missing fields.
 * - When successful, fetcher already guards against Response: "False".
 */
export interface OmdbTitleResponse {
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  Ratings?: OmdbRating[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID: string;
  Type?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

/**
 * App-friendly details returned by `getDetailsByID`.
 */
export type DetailsByID = {
  imdbID: string;
  title: string;
  year?: number;
  type?: string;
  poster?: string;
  plot?: string;
  rated?: string;
  released?: string;
  runtimeMinutes?: number;
  genre?: string[];
  director?: string;
  actors?: string[];
  imdbRating?: number;
  ratings?: OmdbRating[];
};

export type OmdbApiParams = {
  s?: string; // search title
  i?: string; // imdb ID
  t?: string; // specific title
  type?: 'movie' | 'series' | 'episode';
  y?: string | number; // year
  page?: string | number; // pagination
  plot?: 'short' | 'full';
};
