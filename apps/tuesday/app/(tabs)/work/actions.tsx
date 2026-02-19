import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { useIsDesktopWeb } from "../../../hooks/useIsDesktopWeb";

export default function ActionsScreen() {
  const isDesktop = useIsDesktopWeb();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title="Actions" showBack={!isDesktop} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground-muted text-body font-sans">
          Tasks and action items
        </Text>
      </View>
    </SafeAreaView>
  );
}
