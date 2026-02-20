import "../global.css";
import React from "react";
import { View, useColorScheme } from "react-native";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GeistSans: require("../assets/fonts/GeistSans-Regular.ttf"),
    "GeistSans-Light": require("../assets/fonts/GeistSans-Light.ttf"),
    "GeistSans-Medium": require("../assets/fonts/GeistSans-Medium.ttf"),
    "GeistSans-SemiBold": require("../assets/fonts/GeistSans-SemiBold.ttf"),
    "GeistSans-Bold": require("../assets/fonts/GeistSans-Bold.ttf"),
    GeistMono: require("../assets/fonts/GeistMono-Regular.ttf"),
    "GeistMono-SemiBold": require("../assets/fonts/GeistMono-SemiBold.ttf"),
  });

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#FFFFFF" }}>
      <Slot />
    </View>
  );
}
