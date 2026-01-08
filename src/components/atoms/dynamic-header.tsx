import { colors } from "@/lib/constants/colors";
import { hapticImpact } from "@/lib/utils/haptic-feedback";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Typography from "../ui/typography";
import Searchbar from "./searchbar";

type DynamicHeaderProps = {
  isHome: boolean;
  title?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  isSearching?: boolean;
  isOffline?: boolean;
}

export default function DynamicHeader({ isHome, title, searchValue, onSearchChange, onSearchSubmit, onSearchClear, isSearching, isOffline }: DynamicHeaderProps) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
      {isHome ? (
        <Image
          source={require("~/images/splash-icon.png")}
          style={{ width: 32, height: 32 }}
        />
      ) : (
        <Pressable
          onPress={() => {
            hapticImpact("medium");
            router.back();
          }}
          style={{ backgroundColor: colors.black, padding: 8, borderRadius: 52, backdropFilter: "blur(10px)", borderWidth: 1, borderColor: colors["ghost-white"] }}
          hitSlop={10}
        >
          <ArrowLeft size={24} color={colors.white} />
        </Pressable>
      )}

      {isHome ? (
        <View style={{ flexDirection: "row", width: "100%", maxWidth: "70%", }}>
          <Searchbar
            value={searchValue ?? ""}
            onChangeText={onSearchChange ?? (() => {})}
            onSubmit={onSearchSubmit}
            onClear={onSearchClear}
            isSearching={!!isSearching}
            disabled={!!isOffline}
          />
        </View>
      ) : (
        <Typography variant="title" color={colors.white} style={{ marginRight: "auto" }}>{title}</Typography>
      )}

      {isHome && (
        <Pressable
          onPress={() => {
            hapticImpact("medium");
            router.push("/watchlist");
          }}
        >
          <Heart size={24} color={colors.white} />
        </Pressable>
      )}
    </View>
  )
}