import { View } from "react-native";
import Typography from "../ui/typography";
import { colors } from "@/lib/constants/colors";

type EmptyStateProps = {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8 }}>
      <Typography variant="title">{title}</Typography>
      <Typography variant="body" italic color={colors["ghost-white"]} style={{ textAlign: "center" }}>{description}</Typography>
    </View>
  )
}