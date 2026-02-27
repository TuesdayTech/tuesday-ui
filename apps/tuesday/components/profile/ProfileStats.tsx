import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

interface ProfileStatsProps {
  roundedVolume?: string;
  totalTxns?: number;
  roundedAverageSalesPrice?: string;
  startDate?: number;
  isLoading?: boolean;
}

function StatColumn({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: 16,
          color,
        }}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "GeistSans",
          fontSize: 12,
          color,
          opacity: 0.6,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function ProfileStats({
  roundedVolume,
  totalTxns,
  roundedAverageSalesPrice,
  startDate,
  isLoading,
}: ProfileStatsProps) {
  const t = useThemeColors();
  const accentColor = "#0A84FF";

  if (isLoading) {
    return (
      <View style={{ flexDirection: "row", flex: 1, justifyContent: "space-around" }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 18,
                borderRadius: 4,
                backgroundColor: t.backgroundTertiary,
              }}
            />
            <View
              style={{
                width: 40,
                height: 12,
                borderRadius: 4,
                backgroundColor: t.backgroundTertiary,
                marginTop: 4,
              }}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", flex: 1, justifyContent: "space-around" }}>
      <StatColumn
        value={roundedVolume ?? "--"}
        label={startDate ? `since ${startDate}` : "volume"}
        color={accentColor}
      />
      <StatColumn
        value={totalTxns != null ? String(totalTxns) : "--"}
        label="total sides"
        color={accentColor}
      />
      <StatColumn
        value={roundedAverageSalesPrice ?? "--"}
        label="avg sale"
        color={accentColor}
      />
    </View>
  );
}
