import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type HapticNotificationType = "success" | "warning" | "error";

export type HapticPreset =
  | { type: "selection" }
  | { type: "impact"; style?: HapticImpactStyle }
  | { type: "notification"; notificationType?: HapticNotificationType };

const impactMap: Record<HapticImpactStyle, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
  soft: Haptics.ImpactFeedbackStyle.Soft,
};

const notificationMap: Record<HapticNotificationType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

export async function haptic(preset: HapticPreset = { type: "selection" }) {
  if (Platform.OS === "web") return;

  if (preset.type === "selection") {
    await Haptics.selectionAsync();
    return;
  }

  if (preset.type === "impact") {
    const style = preset.style ?? "light";
    await Haptics.impactAsync(impactMap[style]);
    return;
  }

  const notificationType = preset.notificationType ?? "success";
  await Haptics.notificationAsync(notificationMap[notificationType]);
}

export function hapticSelection() {
  return haptic({ type: "selection" });
}

export function hapticImpact(style: HapticImpactStyle = "light") {
  return haptic({ type: "impact", style });
}

export function hapticNotify(notificationType: HapticNotificationType = "success") {
  return haptic({ type: "notification", notificationType });
}

export default haptic;

