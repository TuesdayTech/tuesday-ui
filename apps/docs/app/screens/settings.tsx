import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Toggle, Divider, Avatar, ListItem,
} from "@tuesday-ui/ui";

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [biometric, setBiometric] = useState(false);

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-lg mx-auto gap-6">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back to docs</Button>
        </Link>

        <Text className="text-3xl font-semibold text-foreground">Settings</Text>

        {/* Account */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Account</Text>
          <Box className="bg-surface rounded-xl p-4">
            <HStack className="items-center gap-3">
              <Avatar initials="AR" size="lg" />
              <VStack className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-foreground">Alex Realty</Text>
                <Text className="text-sm text-foreground-muted">alex@ontuesday.com</Text>
              </VStack>
              <Button variant="outline" size="sm">Edit</Button>
            </HStack>
          </Box>
        </VStack>

        {/* Notifications */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Notifications</Text>
          <Box className="bg-surface rounded-xl overflow-hidden">
            <HStack className="items-center justify-between p-4">
              <VStack className="gap-0.5 flex-1">
                <Text className="text-base text-foreground">Push Notifications</Text>
                <Text className="text-sm text-foreground-muted">New listings & price drops</Text>
              </VStack>
              <Toggle checked={pushNotifications} onChange={setPushNotifications} />
            </HStack>
            <Divider />
            <HStack className="items-center justify-between p-4">
              <VStack className="gap-0.5 flex-1">
                <Text className="text-base text-foreground">Email Alerts</Text>
                <Text className="text-sm text-foreground-muted">Weekly market reports</Text>
              </VStack>
              <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
            </HStack>
          </Box>
        </VStack>

        {/* Preferences */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Preferences</Text>
          <Box className="bg-surface rounded-xl overflow-hidden">
            <HStack className="items-center justify-between p-4">
              <VStack className="gap-0.5 flex-1">
                <Text className="text-base text-foreground">Dark Mode</Text>
                <Text className="text-sm text-foreground-muted">Use dark theme</Text>
              </VStack>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </HStack>
            <Divider />
            <HStack className="items-center justify-between p-4">
              <VStack className="gap-0.5 flex-1">
                <Text className="text-base text-foreground">Biometric Login</Text>
                <Text className="text-sm text-foreground-muted">Face ID / Fingerprint</Text>
              </VStack>
              <Toggle checked={biometric} onChange={setBiometric} />
            </HStack>
          </Box>
        </VStack>

        {/* Actions */}
        <VStack className="gap-3 pb-8">
          <Button variant="outline">Privacy Policy</Button>
          <Button variant="outline">Terms of Service</Button>
          <Button variant="destructive">Log Out</Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
