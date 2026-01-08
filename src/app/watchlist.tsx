import DynamicHeader from "@/components/atoms/dynamic-header";
import AppGradientContainer from "@/components/layout/app-gradient-container";
import EmptyState from "@/components/layout/empty-state";
import Typography from "@/components/ui/typography";
import { colors } from "@/lib/constants/colors";
import { useWatchlistStore } from "@/lib/store/watchlist";
import { hapticImpact } from "@/lib/utils/haptic-feedback";
import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WatchlistScreen() {
  const ids = useWatchlistStore((s) => s.ids);
  const byId = useWatchlistStore((s) => s.byId);
  const remove = useWatchlistStore((s) => s.remove);

  const items = ids.map((id) => byId[id]).filter(Boolean);

  return (
    <AppGradientContainer>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <DynamicHeader isHome={false} title="Watchlist" />

        {items.length === 0 ? (
          <EmptyState title="No watchlist yet" description="Tap the heart icon on a movie to save it for later." />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.imdbID}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 140 }}
            renderItem={({ item }) => {
              const posterUri =
                (item.details?.poster && item.details.poster !== "N/A" ? item.details.poster : undefined) ??
                (item.searchSnapshot?.Poster && item.searchSnapshot.Poster !== "N/A" ? item.searchSnapshot.Poster : undefined);

              return (
                <View style={{ flexDirection: "row", gap: 12, width: "100%", alignItems: "flex-start", marginBottom: 14 }}>
                  <View style={{ width: 84, height: 110, borderRadius: 10, overflow: "hidden", backgroundColor: colors.black }}>
                    {posterUri ? <Image source={{ uri: posterUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Typography variant="body" numberOfLines={1} style={{ flex: 1 }}>
                        {item.details?.title ?? item.searchSnapshot?.Title ?? "Unknown title"}
                      </Typography>

                      <Pressable
                        hitSlop={10}
                        onPress={() => {
                          hapticImpact("medium");
                          remove(item.imdbID);
                        }}
                        style={{ padding: 6 }}
                      >
                        <Trash2 size={18} color={colors.white} />
                      </Pressable>
                    </View>

                    <Typography variant="caption" color={colors["ghost-white"]} numberOfLines={1}>
                      {item.details?.year ? `${item.details.year}` : item.searchSnapshot?.Year ?? "—"}
                      {item.details?.imdbRating ? ` • IMDb: ${item.details.imdbRating.toFixed(1)}/10` : ""}
                    </Typography>

                    {item.details?.plot ? (
                      <Typography variant="caption" numberOfLines={3}>
                        {item.details.plot}
                      </Typography>
                    ) : null}

                    {item.details?.actors?.length ? (
                      <Typography variant="caption" color={colors["ghost-white"]} numberOfLines={1}>
                        Actors: {item.details.actors.join(", ")}
                      </Typography>
                    ) : null}
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </AppGradientContainer>
  );
}