import React from "react";
import { View, Text, Image } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getInitials } from "../../lib/profile/utils";

interface ProfileAvatarProps {
  uri?: string;
  name?: string;
  size?: number;
}

export function ProfileAvatar({ uri, name, size = 84 }: ProfileAvatarProps) {
  const t = useThemeColors();

  if (uri) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.1)",
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.backgroundTertiary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
      }}
    >
      <Text
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: size * 0.35,
          color: t.foregroundMuted,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
