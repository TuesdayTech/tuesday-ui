import React from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GearSix, Rows } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function FeedScreen() {
  const t = useThemeColors();
  const scheme = useColorScheme();
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
        {/* DEBUG: remove after dark mode fix */}
        <View className="mb-3 rounded-md border border-border p-3" style={{ backgroundColor: t.backgroundSecondary }}>
          <Text style={{ color: t.foreground, fontFamily: "GeistMono", fontSize: 12 }}>
            {`scheme: "${scheme}" | hook bg: ${t.background}`}
          </Text>
          <View className="mt-3 flex-row gap-2">
            <View style={{ width: 40, height: 40, backgroundColor: "#000", borderRadius: 4 }} />
            <View className="h-10 w-10 rounded-sm bg-white dark:bg-black" />
            <View className="h-10 w-10 rounded-sm bg-background" />
          </View>
          <Text style={{ color: t.foregroundMuted, fontFamily: "GeistMono", fontSize: 10, marginTop: 4 }}>
            hardcoded | dark:bg-black | bg-background
          </Text>
        </View>
        <Text className="text-foreground-muted text-body font-sans">
          Your feed will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}
