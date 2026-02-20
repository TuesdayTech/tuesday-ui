import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, GearSix } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useThemeColors } from "../../hooks/useThemeColors";

export default function ProfileScreen() {
  const t = useThemeColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      <ScreenHeader
        title="Profile"
        rightActions={
          <>
            <Pressable hitSlop={8}>
              <Bell size={22} color={t.foregroundMuted} weight="regular" />
            </Pressable>
            <Pressable hitSlop={8}>
              <GearSix size={22} color={t.foregroundMuted} weight="regular" />
            </Pressable>
          </>
        }
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground-muted text-body font-sans">
          Your profile and settings
        </Text>
      </View>
    </SafeAreaView>
  );
}
