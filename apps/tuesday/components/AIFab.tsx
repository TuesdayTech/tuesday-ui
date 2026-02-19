import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkle } from "phosphor-react-native";
import { useIsDesktopWeb } from "../hooks/useIsDesktopWeb";

export function AIFab() {
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktopWeb();

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
          backgroundColor: pressed ? "#1A1A1A" : "#111111",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: "#333333",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        })}
      >
        <Sparkle size={20} color="#EDEDED" weight="fill" />
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 15,
            color: "#EDEDED",
          }}
        >
          AI
        </Text>
      </Pressable>
    </View>
  );
}
