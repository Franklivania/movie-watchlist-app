import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Typography from "../ui/typography";
import { colors } from "@/lib/constants/colors";
import { Loader2 } from "lucide-react-native";
import { hapticImpact } from "@/lib/utils/haptic-feedback";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry: () => Promise<void>;
  isLoading: boolean;
}

export default function ErrorState({ title, description, onRetry, isLoading }: ErrorStateProps) {
  const handleRetry = async () => {
    hapticImpact("medium");
    try {
      await onRetry();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8 }}>
      <Typography variant="title">{title}</Typography>
      <Typography variant="body">{description}</Typography>

      <TouchableOpacity onPress={handleRetry} disabled={isLoading} style={{ marginTop: 16, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 48, borderRadius: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", opacity: isLoading ? 0.5 : 1 }}>
        {isLoading ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color={colors.white} />
            <Typography variant="body" color={colors.white}>Loading...</Typography>
          </View>
        ) : (
          <Typography variant="body">
            Try again
          </Typography>
        )}
      </TouchableOpacity>
    </View>
  )
}