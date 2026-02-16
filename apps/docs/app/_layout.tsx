import "../global.css";
import React from "react";
import { Slot } from "expo-router";
import { Pressable } from "react-native";
import { useFonts } from "expo-font";
import { ThemeProvider, Text } from "@tuesday-ui/ui";
import { useTheme } from "@tuesday-ui/hooks";

function ThemeToggle() {
  const { isDark, setMode } = useTheme();
  return (
    <Pressable
      onPress={() => setMode(isDark ? "light" : "dark")}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-surface items-center justify-center shadow-lg border border-border"
      style={{ position: "absolute" as any }}
    >
      <Text className="text-lg">{isDark ? "☀️" : "🌙"}</Text>
    </Pressable>
  );
}

function LayoutInner() {
  return (
    <>
      <ThemeToggle />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    GeistMono: require("../assets/fonts/GeistMono-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider defaultMode="dark">
      <LayoutInner />
    </ThemeProvider>
  );
}
