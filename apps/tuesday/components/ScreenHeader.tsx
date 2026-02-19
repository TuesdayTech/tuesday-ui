import React, { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightActions?: ReactNode;
}

export function ScreenHeader({ title, showBack, rightActions }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {showBack && (
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <CaretLeft size={22} color="#EDEDED" weight="bold" />
          </Pressable>
        )}
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 24,
            lineHeight: 32,
            color: "#EDEDED",
          }}
        >
          {title}
        </Text>
      </View>
      {rightActions && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {rightActions}
        </View>
      )}
    </View>
  );
}
