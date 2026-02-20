import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GearSix, Rows } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function FeedScreen() {
  const t = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title="Feed"
        rightActions={
          <>
            <Pressable hitSlop={8}>
              <Rows size={22} color={t.foregroundMuted} weight="regular" />
            </Pressable>
            <Pressable hitSlop={8}>
              <GearSix size={22} color={t.foregroundMuted} weight="regular" />
            </Pressable>
          </>
        }
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground-muted text-body font-sans">
          Your feed will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}
