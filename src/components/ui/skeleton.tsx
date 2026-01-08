import { colors } from "@/lib/constants/colors";
import { useEffect, useMemo, useRef } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import { Animated, Easing } from "react-native";

type SkeletonProps = {
  width?: DimensionValue | undefined;
  height?: DimensionValue | undefined;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ width = "100%", height = 12, radius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const baseStyle = useMemo<ViewStyle>(
    () => ({
      width,
      height, 
      borderRadius: radius,
      backgroundColor: colors.black,
    }),
    [width, height, radius]
  );

  return <Animated.View style={[baseStyle, { opacity }, style]} />;
}


