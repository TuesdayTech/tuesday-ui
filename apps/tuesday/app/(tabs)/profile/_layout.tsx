import React from "react";
import { Stack, Slot } from "expo-router";
import { useIsDesktopWeb } from "../../../hooks/useIsDesktopWeb";

export default function ProfileLayout() {
  const isDesktopWeb = useIsDesktopWeb();

  if (isDesktopWeb) return <Slot />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
