import { DetailsByID, OmdbApiParams, OmdbTitleResponse, SearchResponse } from './omdb-types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const buildOmdbUrl = (params: OmdbApiParams): string => {
  if (!API_URL) {
    throw new Error('Missing EXPO_PUBLIC_API_URL');
  }
  if (!API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_API_KEY');
  }

  const url = new URL(API_URL);
  url.searchParams.set('apikey', API_KEY);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
};

const omdbApiFetcher = async <T>(params: OmdbApiParams): Promise<T> => {
  const url = buildOmdbUrl(params);

  const response = await fetch(url);
  let data: unknown = null;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Failed to parse JSON response from OMDb API");
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'Error' in data && typeof (data as any).Error === 'string'
        ? (data as any).Error
        : `HTTP ${response.status} ${response.statusText}`.trim();
    throw new Error(message);
  }

  // Handle OMDb API specific errors where it returns 200 OK but "Response": "False"
  if (typeof data === 'object' && data !== null && 'Response' in data && (data as any).Response === 'False') {
    throw new Error((data as any).Error || 'An unknown API error occurred');
  }

  return data as T;
};

const naToUndefined = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === 'N/A') return undefined;
  return trimmed;
};

const splitCsv = (value?: string): string[] | undefined => {
  const v = naToUndefined(value);
  if (!v) return undefined;
  const parts = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
};

const parseYear = (value?: string): number | undefined => {
  const v = naToUndefined(value);
  if (!v) return undefined;
  // OMDb sometimes returns "2010–2013" for series. We'll take the first year if present.
  const match = v.match(/\d{4}/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : undefined;
};

const parseRuntimeMinutes = (value?: string): number | undefined => {
  const v = naToUndefined(value);
  if (!v) return undefined;
  const match = v.match(/(\d+)\s*min/i);
  if (!match) return undefined;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : undefined;
};

const parseRatingNumber = (value?: string): number | undefined => {
  const v = naToUndefined(value);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Specific function for search
export const searchByKeyword = (
  searchTerm: string,
  page: number = 1,
  type: NonNullable<OmdbApiParams['type']> = 'movie',
  year?: NonNullable<OmdbApiParams['y']>
): Promise<SearchResponse> => {
  return omdbApiFetcher<SearchResponse>({
    s: searchTerm.trim(),
    page,
    type,
    y: year,
  });
};

export const searchByTitle = (
  title: string,
  page: number = 1,
  type: NonNullable<OmdbApiParams['type']> = 'movie',
  year?: NonNullable<OmdbApiParams['y']>
): Promise<SearchResponse> => {
  return omdbApiFetcher<SearchResponse>({
    t: title.trim(),
    page,
    type,
    y: year,
  });
};


export const getDetailsByID = async (imdbID: string, plot: NonNullable<OmdbApiParams['plot']> = 'short'): Promise<DetailsByID> => {
  const id = imdbID.trim();
  if (!id) throw new Error('Missing imdbID');

  const data = await omdbApiFetcher<OmdbTitleResponse>({
    i: id,
    plot,
  });

  return {
    imdbID: data.imdbID,
    title: data.Title,
    year: parseYear(data.Year),
    type: naToUndefined(data.Type),
    poster: naToUndefined(data.Poster),
    plot: naToUndefined(data.Plot),
    rated: naToUndefined(data.Rated),
    released: naToUndefined(data.Released),
    runtimeMinutes: parseRuntimeMinutes(data.Runtime),
    genre: splitCsv(data.Genre),
    director: naToUndefined(data.Director),
    actors: splitCsv(data.Actors),
    imdbRating: parseRatingNumber(data.imdbRating),
    ratings: data.Ratings?.length ? data.Ratings : undefined,
  };
};


export const getDetailsByIDs = async (
  imdbIDs: string[],
  plot: NonNullable<OmdbApiParams['plot']> = 'short'
): Promise<DetailsByID[]> => {
  const ids = imdbIDs.map((id) => id.trim()).filter(Boolean);
  const results = await Promise.allSettled(ids.map((id) => getDetailsByID(id, plot)));

  const fulfilled = results
    .filter((r): r is PromiseFulfilledResult<DetailsByID> => r.status === "fulfilled")
    .map((r) => r.value);

  const rejected = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  // Only treat missing config as fatal for the whole batch; otherwise allow partial results.
  const fatal = rejected.find((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    return /Missing EXPO_PUBLIC_API_(URL|KEY)/i.test(msg);
  });
  if (fatal) throw fatal;

  return fulfilled;
};

