import { colors } from "@/lib/constants/colors";
import { Image } from "expo-image";
import { ActivityIndicator, View } from "react-native";

export default function LoadingState() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8, opacity: 0.5 }}>
      <Image source={require("~/images/splash-icon.png")} style={{ width: 100, height: 100 }} contentFit="contain" />
      <ActivityIndicator size="large" color={colors.white} style={{position: "absolute", top: 52, left: 24, right: 0, bottom: 0}} />
    </View>
  )
}