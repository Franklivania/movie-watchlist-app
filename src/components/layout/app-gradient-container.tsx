import { colors } from "@/lib/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";

type AppGradientContainerProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function mixHex(hexA: string, hexB: string, amountB: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.min(1, Math.max(0, amountB));
  const r = Math.round(a.r * (1 - t) + b.r * t);
  const g = Math.round(a.g * (1 - t) + b.g * t);
  const bl = Math.round(a.b * (1 - t) + b.b * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const crimsonDeep = mixHex(colors.primary, colors.black, 0.85);

export default function AppGradientContainer({ children, style }: AppGradientContainerProps) {
  return (
    <LinearGradient
      colors={[colors.black, crimsonDeep, crimsonDeep, crimsonDeep]}
      locations={[0, 0.6, 0.85, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
        {children}
    </LinearGradient>
  );
}