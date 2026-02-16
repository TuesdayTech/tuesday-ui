import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Text, HStack } from "@tuesday-ui/ui";

type Mode = "mobile" | "desktop";

export function PreviewFrame({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("desktop");

  return (
    <View className="flex-1 bg-background">
      <HStack className="gap-2 p-3 border-b border-border">
        <Pressable
          onPress={() => setMode("mobile")}
          className={`px-3 py-1.5 rounded-lg ${mode === "mobile" ? "bg-primary" : "bg-surface"}`}
        >
          <Text className={`text-sm ${mode === "mobile" ? "text-primary-foreground" : "text-foreground-muted"}`}>
            📱 Mobile
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("desktop")}
          className={`px-3 py-1.5 rounded-lg ${mode === "desktop" ? "bg-primary" : "bg-surface"}`}
        >
          <Text className={`text-sm ${mode === "desktop" ? "text-primary-foreground" : "text-foreground-muted"}`}>
            🖥 Desktop
          </Text>
        </Pressable>
      </HStack>

      <View className="flex-1 items-center">
        <ScrollView
          className="flex-1 bg-background"
          style={mode === "mobile" ? { width: 375 } : { width: "100%" as any }}
          contentContainerStyle={mode === "mobile" ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(128,128,128,0.2)", minHeight: "100%" } : undefined}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
