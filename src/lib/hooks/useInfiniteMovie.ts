import { searchByKeyword } from "@/service/omdb-api";
import type { SearchResponse } from "@/service/omdb-types";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

type UseInfiniteMovieOptions = {
  keyword: string;
  type?: "movie" | "series";
  year?: number;
  minYear?: number;
};

type PageParam = { page: number; year: number };

const isEmptyYearError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return /Movie not found|Series not found|Episode not found|not found/i.test(msg);
};

export const useInfiniteMovie = ({ keyword, year = new Date().getFullYear(), minYear = 1900, type = "movie" }: UseInfiniteMovieOptions) => {
  const trimmed = keyword.trim();

  return useInfiniteQuery<SearchResponse, Error, SearchResponse, readonly unknown[], PageParam>({
    queryKey: ["movies", trimmed, type, year, minYear],
    enabled: trimmed.length > 0 && Number.isFinite(year) && Number.isFinite(minYear) && year >= minYear,
    placeholderData: keepPreviousData,

    initialPageParam: { page: 1, year },
    queryFn: async ({ pageParam }) => {
      try {
        return await searchByKeyword(trimmed, pageParam.page, type, pageParam.year);
      } catch (err) {
        // Don't break infinite scroll if page/year has no results.
        if (isEmptyYearError(err)) {
          return { Response: "False", Search: [], totalResults: "0", Error: (err as Error)?.message } as SearchResponse;
        }
        throw err;
      }
    },

    // Render data in FlatList format for use
    select: (infiniteData) => {
      const Search = infiniteData.pages.flatMap((p) => p.Search ?? []);
      return {
        Search,
        totalResults: String(Search.length),
        Response: Search.length > 0 ? "True" : "False",
      };
    },

    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const hasResults = lastPage.Response === "True" && (lastPage.Search?.length ?? 0) > 0;

      if (hasResults) {
        return { year: lastPageParam.year, page: lastPageParam.page + 1 };
      }

      // End of year, move to previous year.
      const nextYear = lastPageParam.year - 1;
      return nextYear >= minYear ? { year: nextYear, page: 1 } : undefined;
    },
  });
};


