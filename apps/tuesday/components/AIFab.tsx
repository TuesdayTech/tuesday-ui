import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkle } from "phosphor-react-native";
import { useIsDesktopWeb } from "../hooks/useIsDesktopWeb";
import { useThemeColors } from "../hooks/useThemeColors";

export function AIFab() {
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktopWeb();
  const t = useThemeColors();

  // On mobile, sit above the tab bar (~50px) + safe area bottom
  const bottomOffset = isDesktop ? 20 : 50 + insets.bottom + 12;

  return (
    <View
      style={{ position: "absolute", bottom: bottomOffset, right: 16 }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          // TODO: open AI overlay panel
        }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: pressed ? t.backgroundTertiary : t.backgroundSecondary,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: t.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        })}
      >
        <Sparkle size={20} color={t.foreground} weight="fill" />
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 15,
            color: t.foreground,
          }}
        >
          AI
        </Text>
      </Pressable>
    </View>
  );
}
