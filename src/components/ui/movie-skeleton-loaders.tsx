import Skeleton from "@/components/ui/skeleton";
import { colors } from "@/lib/constants/colors";
import { View } from "react-native";

export function GridMovieDetailsSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      <Skeleton height={12} width="85%" radius={6} />
      <View style={{ height: 6 }} />
      <Skeleton height={10} width="50%" radius={6} style={{ backgroundColor: colors["ghost-white"], opacity: 0.5 }} />
    </View>
  );
}

export function ListMovieDetailsSkeleton() {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Skeleton height={14} width="70%" radius={6} />
      <Skeleton height={10} width="55%" radius={6} style={{ backgroundColor: colors["ghost-white"], opacity: 0.5 }} />
      <View style={{ gap: 5 }}>
        <Skeleton height={10} width="100%" radius={6} />
        <Skeleton height={10} width="92%" radius={6} />
      </View>
      <Skeleton height={10} width="80%" radius={6} style={{ backgroundColor: colors["ghost-white"], opacity: 0.5 }} />
    </View>
  );
}


