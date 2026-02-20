import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { useIsDesktopWeb } from "../../../hooks/useIsDesktopWeb";
import { useThemeColors } from "../../../hooks/useThemeColors";

export default function ActionsScreen() {
  const isDesktop = useIsDesktopWeb();
  const t = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      <ScreenHeader title="Actions" showBack={!isDesktop} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground-muted text-body font-sans">
          Tasks and action items
        </Text>
      </View>
    </SafeAreaView>
  );
}
