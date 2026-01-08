import { colors } from "@/lib/constants/colors";
import { getFontSize } from "@/lib/utils/font";
import type { ReactNode } from "react";
import type { StyleProp, TextProps, TextStyle } from "react-native";
import { Text } from "react-native";

export type TypographyVariant =
  | "display"
  | "title"
  | "headline"
  | "subhead"
  | "body"
  | "bodySmall"
  | "caption"
  | "label";

export type TypographyProps = Omit<TextProps, "style"> & {
  children?: ReactNode;
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
  italic?: boolean;
  size?: number;
  align?: TextStyle["textAlign"];
  style?: StyleProp<TextStyle>;
};

const variantStyle: Record<TypographyVariant, Pick<TextStyle, "fontSize" | "lineHeight" | "letterSpacing">> =
  {
    display: { fontSize: getFontSize(34), lineHeight: getFontSize(40), letterSpacing: -0.6 },
    title: { fontSize: getFontSize(28), lineHeight: getFontSize(34), letterSpacing: -0.2 },
    headline: { fontSize: getFontSize(22), lineHeight: getFontSize(28), letterSpacing: -0.1 },
    subhead: { fontSize: getFontSize(18), lineHeight: getFontSize(24), letterSpacing: 0 },
    body: { fontSize: getFontSize(16), lineHeight: getFontSize(22), letterSpacing: 0 },
    bodySmall: { fontSize: getFontSize(14), lineHeight: getFontSize(20), letterSpacing: 0 },
    caption: { fontSize: getFontSize(12), lineHeight: getFontSize(16), letterSpacing: 0.2 },
    label: { fontSize: getFontSize(13), lineHeight: getFontSize(18), letterSpacing: 0.3 },
  };

export function Typography({
  children,
  variant = "body",
  color = "white",
  italic = false,
  size,
  align,
  style,
  ...props
}: TypographyProps) {
  const resolvedColor = typeof color === "string" && color in colors ? colors[color as keyof typeof colors] : color;

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: italic ? "DmSans-Italic" : "DmSans",
          color: resolvedColor,
          textAlign: align,
        },
        variantStyle[variant],
        typeof size === "number"
          ? {
              fontSize: getFontSize(size),
              lineHeight: getFontSize(Math.round(size * 1.35)),
            }
          : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export default Typography;