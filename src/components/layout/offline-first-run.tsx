import Typography from "@/components/ui/typography";
import { colors } from "@/lib/constants/colors";
import { hapticImpact } from "@/lib/utils/haptic-feedback";
import { TouchableOpacity, View } from "react-native";

type OfflineFirstRunProps = {
  onRetry: () => void;
  isRetrying?: boolean;
};

export default function OfflineFirstRun({ onRetry, isRetrying = false }: OfflineFirstRunProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Typography variant="title">You're offline</Typography>
      <Typography variant="body" color={colors["ghost-white"]} style={{ textAlign: "center", maxWidth: 320 }}>
        Connect to Wi‑Fi or mobile data to load movies for the first time.
      </Typography>

      <TouchableOpacity
        onPress={() => {
          hapticImpact("medium");
          onRetry();
        }}
        disabled={isRetrying}
        style={{
          marginTop: 14,
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 48,
          borderRadius: 32,
          opacity: isRetrying ? 0.5 : 1,
        }}
      >
        <Typography variant="body" color={colors.white}>
          {isRetrying ? "Checking..." : "Retry"}
        </Typography>
      </TouchableOpacity>
    </View>
  );
}


