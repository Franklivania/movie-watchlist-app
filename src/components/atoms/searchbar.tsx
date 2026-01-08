import { colors } from "@/lib/constants/colors";
import { Search, X } from "lucide-react-native";
import type { TextInputProps } from "react-native";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

type SearchbarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  isSearching?: boolean;
  disabled?: boolean;
} & Omit<TextInputProps, "value" | "onChangeText">;

export default function Searchbar({ value, onChangeText, onSubmit, onClear, isSearching = false, disabled = false, ...props }: SearchbarProps) {
  return (
    <View style={{ position: "relative", flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors["ghost-white"], borderRadius: 52, overflow: "hidden", opacity: disabled ? 0.6 : 1 }}>
      <TextInput
        placeholder="Search for a movie"
        placeholderTextColor={colors["ghost-white"]}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        editable={!disabled}
        onSubmitEditing={disabled ? undefined : onSubmit}
        style={{ flex: 1, color: colors.white, paddingLeft: 40, paddingRight: 74, paddingVertical: 12 }}
        {...props}
      />
      <Search size={24} color={colors.white} style={{ position: "absolute", left: 12, opacity: 1 }} />

      <View style={{ position: "absolute", right: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
        {!!value && (
          <Pressable hitSlop={10} onPress={onClear} disabled={disabled} style={{ padding: 2, opacity: disabled ? 0.6 : 1 }}>
            <X size={18} color={colors["ghost-white"]} />
          </Pressable>
        )}
        {isSearching && !disabled && <ActivityIndicator size="small" color={colors.white} />}
      </View>
    </View>
  )
}