import React from "react";
import { Pressable, View } from "react-native";
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
          alignItems: "center",
          justifyContent: "center",
          width: isDesktop ? 52 : 48,
          height: isDesktop ? 52 : 48,
          backgroundColor: pressed ? t.backgroundTertiary : t.backgroundSecondary,
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
      </Pressable>
    </View>
  );
}
