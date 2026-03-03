import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

interface ProfileBioProps {
  bio?: string;
  isLoading?: boolean;
  isNonAgent?: boolean;
}

export function ProfileBio({ bio, isLoading, isNonAgent }: ProfileBioProps) {
  const t = useThemeColors();

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              height: 14,
              borderRadius: 4,
              backgroundColor: t.backgroundTertiary,
              marginBottom: 6,
              width: i === 3 ? "60%" : "100%",
            }}
          />
        ))}
      </View>
    );
  }

  if (!bio) return null;

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
      <Text
        numberOfLines={4}
        style={{
          fontFamily: "GeistSans",
          fontSize: 16,
          color: isNonAgent ? "#FFFFFF" : t.foreground,
          lineHeight: 22,
        }}
      >
        {bio}
      </Text>
    </View>
  );
}
