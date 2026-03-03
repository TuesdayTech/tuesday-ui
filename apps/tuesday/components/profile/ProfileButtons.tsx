import React from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

interface ProfileButtonsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowLoading?: boolean;
  onFollowPress?: () => void;
  onEditPress?: () => void;
  onSharePress?: () => void;
}

export function ProfileButtons({
  isOwnProfile,
  isFollowing,
  isFollowLoading,
  onFollowPress,
  onEditPress,
  onSharePress,
}: ProfileButtonsProps) {
  const t = useThemeColors();
  const accent = t.foreground;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        paddingTop: 12,
      }}
    >
      {isOwnProfile ? (
        <Pressable
          onPress={onEditPress}
          style={{
            flex: 1,
            height: 32,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: accent,
            backgroundColor: t.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 13,
              color: accent,
            }}
          >
            Edit Profile
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onFollowPress}
          disabled={isFollowLoading}
          style={{
            flex: 1,
            height: 32,
            borderRadius: 8,
            borderWidth: isFollowing ? 1.5 : 0,
            borderColor: accent,
            backgroundColor: isFollowing
              ? t.background
              : isFollowLoading
                ? t.backgroundTertiary
                : accent,
            alignItems: "center",
            justifyContent: "center",
            opacity: isFollowLoading ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 13,
              color: isFollowing ? accent : t.background,
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onSharePress}
        style={{
          flex: 1,
          height: 32,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: accent,
          backgroundColor: t.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 13,
            color: accent,
          }}
        >
          Share Profile
        </Text>
      </Pressable>
    </View>
  );
}
