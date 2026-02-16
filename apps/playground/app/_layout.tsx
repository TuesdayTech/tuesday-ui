import "../global.css";
import React from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { ThemeProvider } from "@tuesday-ui/ui";

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
      <Slot />
    </ThemeProvider>
  );
}
