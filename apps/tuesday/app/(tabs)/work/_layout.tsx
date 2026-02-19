import React from "react";
import { Stack } from "expo-router";
import { Slot } from "expo-router";
import { useIsDesktopWeb } from "../../../hooks/useIsDesktopWeb";

export default function WorkLayout() {
  const isDesktopWeb = useIsDesktopWeb();

  if (isDesktopWeb) return <Slot />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="actions" />
      <Stack.Screen name="deals" />
      <Stack.Screen name="links" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="team" />
    </Stack>
  );
}
