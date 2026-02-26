import React from "react";
import { View, TextInput, Text } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface RangeInputRowProps {
  minValue: string;
  maxValue: string;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  keyboardType?: "numeric" | "decimal-pad" | "number-pad";
}

export function RangeInputRow({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "NO MIN",
  maxPlaceholder = "NO MAX",
  keyboardType = "numeric",
}: RangeInputRowProps) {
  const t = useThemeColors();

  const inputStyle = {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.backgroundSecondary,
    paddingHorizontal: 12,
    color: t.foreground,
    fontFamily: "GeistSans",
    fontSize: 15,
  };

  return (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <TextInput
        value={minValue}
        onChangeText={onMinChange}
        placeholder={minPlaceholder}
        placeholderTextColor={t.foregroundSubtle}
        keyboardType={keyboardType}
        style={inputStyle}
      />
      <View
        style={{
          width: 16,
          height: 1,
          backgroundColor: t.foregroundSubtle,
        }}
      />
      <TextInput
        value={maxValue}
        onChangeText={onMaxChange}
        placeholder={maxPlaceholder}
        placeholderTextColor={t.foregroundSubtle}
        keyboardType={keyboardType}
        style={inputStyle}
      />
    </View>
  );
}
