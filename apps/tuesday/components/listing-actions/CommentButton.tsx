import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChatCircle } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

interface CommentButtonProps {
  commentsCount: number;
  disabled?: boolean;
  onPress: () => void;
}

export function CommentButton({
  commentsCount,
  disabled,
  onPress,
}: CommentButtonProps) {
  const t = useThemeColors();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        style={{
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChatCircle size={24} color={t.foreground} weight="bold" />
        {commentsCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#E5484D",
            }}
          />
        )}
      </Pressable>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        style={{ opacity: commentsCount > 0 ? 1 : 0 }}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 12,
            color: t.foreground,
            width: Math.max(1, String(commentsCount).length) * 10,
            textAlign: "center",
          }}
        >
          {commentsCount}
        </Text>
      </Pressable>
    </View>
  );
}
