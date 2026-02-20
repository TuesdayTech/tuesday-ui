import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sliders } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function SearchScreen() {
  const t = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title="Search"
        rightActions={
          <Pressable hitSlop={8}>
            <Sliders size={22} color={t.foregroundMuted} weight="regular" />
          </Pressable>
        }
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground-muted text-body font-sans">
          Search listings, contacts, and more
        </Text>
      </View>
    </SafeAreaView>
  );
}
