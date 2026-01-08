import DynamicHeader from "@/components/atoms/dynamic-header";
import AppGradientContainer from "@/components/layout/app-gradient-container";
import ErrorState from "@/components/layout/error-state";
import LoadingState from "@/components/layout/loading-state";
import OfflineFirstRun from "@/components/layout/offline-first-run";
import { GridMovieDetailsSkeleton, ListMovieDetailsSkeleton } from "@/components/ui/movie-skeleton-loaders";
import Typography from "@/components/ui/typography";
import { colors } from "@/lib/constants/colors";
import { useDetailsByIds } from "@/lib/hooks/useDetailsByIds";
import { useInfiniteMovie } from "@/lib/hooks/useInfiniteMovie";
import { useWatchlistStore } from "@/lib/store/watchlist";
import { hapticImpact } from "@/lib/utils/haptic-feedback";
import { getDetailsByID } from "@/service/omdb-api";
import { DetailsByID, MovieSearchResult } from "@/service/omdb-types";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { Image } from "expo-image";
import { Heart, LayoutGrid, List, RotateCw } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [displayMode, setDisplayMode] = useState<"list" | "grid">("grid");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [displaySource, setDisplaySource] = useState<"feed" | "search">("feed");
  const { width: screenWidth } = useWindowDimensions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const feedPreloadTriesRef = useRef(0);
  const searchPreloadTriesRef = useRef(0); 
  const netInfo = useNetInfo();
  const isOnline = !!netInfo.isConnected && netInfo.isInternetReachable !== false;
  const watchlistById = useWatchlistStore((s) => s.byId);
  const watchlistToggle = useWatchlistStore((s) => s.toggle);
  const watchlistAddOrUpdate = useWatchlistStore((s) => s.addOrUpdate);
  const watchlistCount = useWatchlistStore((s) => s.ids.length);

  const currentYear = new Date().getFullYear();

  const feedQuery = useInfiniteMovie({
    keyword: "man",
    type: "movie",
    year: currentYear,
  });

  const searchQuery = useInfiniteMovie({
    keyword: activeSearch ?? "",
    type: "movie",
  });

  const isSearchActive = activeSearch !== null;
  const isSearching = isSearchActive && (searchQuery.isLoading || (searchQuery.isFetching && !searchQuery.isFetchingNextPage));

  useEffect(() => {
    if (!isSearchActive) return;
    if (searchQuery.isSuccess && searchQuery.data) {
      setDisplaySource("search");
    }
  }, [isSearchActive, searchQuery.isSuccess, searchQuery.dataUpdatedAt, searchQuery.data]);

  const activeQuery = displaySource === "search" && isSearchActive ? searchQuery : feedQuery;

  const data = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;
  const fetchNextPage = activeQuery.fetchNextPage;
  const hasNextPage = activeQuery.hasNextPage;
  const isFetchingNextPage = activeQuery.isFetchingNextPage;
  const isFetching = activeQuery.isFetching;
  const refetch = activeQuery.refetch;

  //Prevent duplicate movies
  const movies = Array.from(new Map((data?.Search ?? []).map((m) => [m.imdbID, m])).values());
  //Filter movies by id
  const imdbIDs = movies.map((m) => m.imdbID);
  const { data: details } = useDetailsByIds(imdbIDs, "short");
  const detailsById = useMemo(() => new Map((details ?? []).map((d) => [d.imdbID, d] as const)), [details]);
  const isList = displayMode === "list";
  const gridItemWidth = (screenWidth - 48 - 12) / 2;

  const submitSearch = () => {
    if (!isOnline) return;
    const term = searchInput.trim();
    if (!term) return;
    searchPreloadTriesRef.current = 0;
    setActiveSearch(term);
  };

  const clearSearch = () => {
    setSearchInput("");
    setActiveSearch(null);
    searchPreloadTriesRef.current = 0;
    setDisplaySource("feed");
  };

  const doRefresh = async () => {
    if (!isOnline) return;
    setIsRefreshing(true);
    feedPreloadTriesRef.current = 0;
    searchPreloadTriesRef.current = 0;
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOnline) return;
    if (feedQuery.isLoading) return;
    if (!feedQuery.hasNextPage) return;
    if (feedQuery.isFetchingNextPage) return;
    const feedMoviesCount = feedQuery.data?.Search?.length ?? 0;
    if (feedMoviesCount === 0) return;
    if (feedPreloadTriesRef.current >= 5) return;

    feedPreloadTriesRef.current += 1;
    feedQuery.fetchNextPage();
  }, [isOnline, feedQuery.isLoading, feedQuery.hasNextPage, feedQuery.isFetchingNextPage, feedQuery.data?.Search?.length, feedQuery.fetchNextPage]);

  useEffect(() => {
    if (!isOnline) return;
    if (!(displaySource === "search" && isSearchActive)) return;
    if (searchQuery.isLoading) return;
    if (!searchQuery.hasNextPage) return;
    if (searchQuery.isFetchingNextPage) return;
    const searchMoviesCount = searchQuery.data?.Search?.length ?? 0;
    if (searchMoviesCount === 0) return;
    if (searchPreloadTriesRef.current >= 5) return;

    searchPreloadTriesRef.current += 1;
    searchQuery.fetchNextPage();
  }, [
    isOnline,
    displaySource,
    isSearchActive,
    searchQuery.isLoading,
    searchQuery.hasNextPage,
    searchQuery.isFetchingNextPage,
    searchQuery.data?.Search?.length,
    searchQuery.fetchNextPage,
  ]);

  const showOfflineFirstRun = !isOnline && movies.length === 0 && watchlistCount === 0;

  if (showOfflineFirstRun) {
    return (
      <AppGradientContainer>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
          <DynamicHeader
            isHome={true}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={submitSearch}
            onSearchClear={clearSearch}
            isSearching={isSearching}
            isOffline={!isOnline}
          />
          <OfflineFirstRun
            onRetry={() => {
              NetInfo.fetch().then((state) => {
                const online = !!state.isConnected && state.isInternetReachable !== false;
                if (online) {
                  refetch();
                }
              });
            }}
            isRetrying={false}
          />
        </SafeAreaView>
      </AppGradientContainer>
    );
  }

  if (isError && movies.length === 0) {
    return (
      <AppGradientContainer>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
          <DynamicHeader
            isHome={true}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={submitSearch}
            onSearchClear={clearSearch}
            isSearching={isSearching}
            isOffline={!isOnline}
          />
          <ErrorState
            title="Something went wrong"
            description={error?.message ?? "Failed to load movies."}
            onRetry={doRefresh}
            isLoading={isRefreshing || isFetching}
          />
        </SafeAreaView>
      </AppGradientContainer>
    );
  }

  if (isLoading && movies.length === 0) {
    return (
      <AppGradientContainer>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
          <DynamicHeader
            isHome={true}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={submitSearch}
            onSearchClear={clearSearch}
            isSearching={isSearching}
            isOffline={!isOnline}
          />
          <LoadingState />
        </SafeAreaView>
      </AppGradientContainer>
    );
  }

  return (
    <AppGradientContainer>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <DynamicHeader
          isHome={true}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={submitSearch}
          onSearchClear={clearSearch}
          isSearching={isSearching}
          isOffline={!isOnline}
        />
        {!isOnline && (
          <View style={{ marginTop: 10, marginBottom: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.black, borderWidth: 1, borderColor: colors["ghost-white"], opacity: 0.85 }}>
            <Typography variant="caption" color={colors["ghost-white"]}>
              You are offline. Connect to WiFi or mobile data to keep viewing updated content
            </Typography>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6, }}>
          <Typography variant="headline">Movies List</Typography>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
            <Pressable
              hitSlop={10}
              disabled={isRefreshing || isFetching || !isOnline}
              onPress={() => {
                hapticImpact("medium");
                doRefresh();
              }}
              style={{ opacity: isRefreshing || isFetching || !isOnline ? 0.5 : 1 }}
            >
              <RotateCw size={18} color={colors.white} />
            </Pressable>
            <Pressable hitSlop={10} onPress={() => { hapticImpact("heavy"); setDisplayMode("list") }}>
              <List size={18} color={displayMode === "list" ? colors.primary : colors.white} />
            </Pressable>
            <Pressable hitSlop={10} onPress={() => { hapticImpact("heavy"); setDisplayMode("grid") }}>
              <LayoutGrid size={18} color={displayMode === "grid" ? colors.primary : colors.white} />
            </Pressable>
          </View>
        </View>

        <FlatList
          key={displayMode}
          data={movies}
          numColumns={displayMode === "grid" ? 2 : 1}
          keyExtractor={(item) => item.imdbID}
          extraData={displayMode}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 140 }}
          columnWrapperStyle={isList ? undefined : { justifyContent: "space-between" }}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!isOnline) return;
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshing={isRefreshing}
          onRefresh={doRefresh}
          ListFooterComponent={
            <View style={{ paddingVertical: 18, alignItems: "center", gap: 10 }}>
              {isFetchingNextPage ? <ActivityIndicator color={colors.white} /> : null}
              {!isFetchingNextPage && isError && movies.length > 0 ? (
                <Pressable
                  onPress={() => {
                    if (!isOnline) return;
                    hapticImpact("medium");
                    fetchNextPage();
                  }}
                  disabled={!isOnline}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.black }}
                >
                  <Typography variant="label">Retry loading more</Typography>
                </Pressable>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            displaySource === "search" && isSearchActive && !isSearching && !isError ? (
              <View style={{ paddingVertical: 40, alignItems: "center", opacity: 0.9 }}>
                <Typography variant="body">No results</Typography>
                <Typography variant="caption" color={colors["ghost-white"]}>
                  Try a different title or keyword.
                </Typography>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const itemDetails = detailsById.get(item.imdbID);
            const isWishlisted = !!watchlistById[item.imdbID];
            return (
              <MovieItem
                movie={item}
                isList={isList}
                gridItemWidth={gridItemWidth}
                details={itemDetails}
                isWishlisted={isWishlisted}
                onWishlistPress={() => {
                  hapticImpact("medium");
                  const nextIsWishlisted = watchlistToggle(item.imdbID, { details: itemDetails, searchSnapshot: item });
                  if (nextIsWishlisted && !itemDetails && isOnline) {
                    // Fetch and persist full details for offline watchlist access.
                    getDetailsByID(item.imdbID, "short")
                      .then((full) => watchlistAddOrUpdate({ imdbID: item.imdbID, details: full, searchSnapshot: item }))
                      .catch(() => {});
                  }
                }}
              />
            );
          }}
        />

        {isRefreshing && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 24 }}>
            <LoadingState />
          </View>
        )}
      </SafeAreaView>
    </AppGradientContainer>
  );
}

const MovieItem = ({
  movie,
  isList,
  gridItemWidth,
  details,
  isWishlisted,
  onWishlistPress,
}: {
  movie: MovieSearchResult;
  isList: boolean;
  gridItemWidth: number;
  details?: DetailsByID;
  isWishlisted?: boolean;
  onWishlistPress?: () => void;
}) => {
  const ratingText = typeof details?.imdbRating === "number" ? `${details.imdbRating.toFixed(1)}/10` : "—";
  const posterUri =
    (details?.poster && details.poster !== "N/A" ? details.poster : undefined) ??
    (movie.Poster && movie.Poster !== "N/A" ? movie.Poster : undefined);

  return (
    <View style={{ width: isList ? "100%" : gridItemWidth, marginBottom: 14 }}>
      {!isList ? (
        <View style={{ width: "100%" }}>
          <View style={{ width: "100%", aspectRatio: 2 / 3, borderRadius: 14, overflow: "hidden", backgroundColor: colors.black }}>
            {posterUri ? <Image source={{ uri: posterUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Typography variant="bodySmall" numberOfLines={1}>
                {movie.Title}
              </Typography>
              {details ? (
                <Typography variant="caption" color={colors["ghost-white"]}>
                  {details.year ? `${details.year}` : movie.Year} • IMDb: {ratingText}
                </Typography>
              ) : (
                <GridMovieDetailsSkeleton />
              )}
            </View>

            <Pressable hitSlop={10} onPress={onWishlistPress} style={{ padding: 6 }}>
              <Heart size={18} color={isWishlisted ? colors.primary : colors.white} fill={isWishlisted ? colors.primary : "transparent"} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 12, width: "100%", alignItems: "center" }}>
          <View style={{ width: 84, height: 110, borderRadius: 10, overflow: "hidden", backgroundColor: colors.black }}>
            {posterUri ? <Image source={{ uri: posterUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Typography variant="body" numberOfLines={1} style={{ flex: 1 }}>
                {movie.Title}
              </Typography>
              <Pressable hitSlop={10} onPress={onWishlistPress} style={{ padding: 6 }}>
                <Heart size={18} color={isWishlisted ? colors.primary : colors.white} fill={isWishlisted ? colors.primary : "transparent"} />
              </Pressable>
            </View>

            {details ? (
              <>
                <Typography variant="caption" color={colors["ghost-white"]} numberOfLines={1}>
                  {details.year ? `${details.year}` : movie.Year} • IMDb: {ratingText}
                </Typography>

                <Typography variant="caption" numberOfLines={2}>
                  {details.plot ?? "No plot available"}
                </Typography>

                <Typography variant="caption" color={colors["ghost-white"]} numberOfLines={1}>
                  Actors: {details.actors?.join(", ") ?? "—"}
                </Typography>
              </>
            ) : (
              <ListMovieDetailsSkeleton />
            )}
          </View>
        </View>
      )}
    </View>
  );
};
