import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, GearSix } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title="Profile"
        rightActions={
          <>
            <Pressable hitSlop={8}>
              <Bell size={22} color="#A1A1A1" weight="regular" />
            </Pressable>
            <Pressable hitSlop={8}>
              <GearSix size={22} color="#A1A1A1" weight="regular" />
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
