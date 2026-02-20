import React, { ReactNode } from "react";
import { Platform, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { useIsDesktopWeb } from "../hooks/useIsDesktopWeb";
import { TOP_BAR_HEIGHT } from "./SideNav";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightActions?: ReactNode;
}

export function ScreenHeader({ title, showBack, rightActions }: ScreenHeaderProps) {
  const router = useRouter();
  const t = useThemeColors();
  const isDesktop = useIsDesktopWeb();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: isDesktop ? 24 : 16,
        ...(isDesktop
          ? {
              height: TOP_BAR_HEIGHT,
              alignItems: "center" as const,
              paddingTop: 4,
              borderBottomWidth: 1,
              borderBottomColor: t.borderSecondary,
            }
          : {
              alignItems: "center" as const,
              paddingVertical: 12,
            }),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {showBack && (
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <CaretLeft size={22} color={t.foreground} weight="bold" />
          </Pressable>
        )}
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 24,
            lineHeight: 32,
            color: t.foreground,
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
