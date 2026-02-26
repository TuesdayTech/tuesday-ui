import React from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface BedsAndBathsFilterProps {
  label: string;
  minValue?: number;
  onChange: (min?: number) => void;
}

const OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
] as const;

export function BedsAndBathsFilter({
  label,
  minValue,
  onChange,
}: BedsAndBathsFilterProps) {
  const t = useThemeColors();

  return (
    <View>
      <Text
        style={{
          color: t.foreground,
          fontFamily: "GeistSans-SemiBold",
          fontSize: 15,
          marginBottom: 10,
        }}
      >
        {label}
      </Text>
      <View className="flex-row" style={{ gap: 8 }}>
        {OPTIONS.map((opt) => {
          const isSelected = opt.value === minValue;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(opt.value)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 20,
                backgroundColor: isSelected ? "#0A84FF" : t.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: isSelected ? 0 : 1,
                borderColor: t.border,
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : t.foreground,
                  fontFamily: "GeistSans-Medium",
                  fontSize: 14,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
