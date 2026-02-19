import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sliders } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title="Search"
        rightActions={
          <Pressable hitSlop={8}>
            <Sliders size={22} color="#A1A1A1" weight="regular" />
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
