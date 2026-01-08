import { getDetailsByIDs } from "@/service/omdb-api";
import type { DetailsByID, OmdbApiParams } from "@/service/omdb-types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useDetailsByIds = (imdbIDs: string[], plot: NonNullable<OmdbApiParams["plot"]> = "short") => {
  const ids = imdbIDs.map((id) => id.trim()).filter(Boolean);

  return useQuery<DetailsByID[], Error>({
    queryKey: ["detailsByIds", ids, plot],
    enabled: ids.length > 0,
    queryFn: () => getDetailsByIDs(ids, plot),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 30,
  });
};


