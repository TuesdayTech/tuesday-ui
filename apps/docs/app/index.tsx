import React from "react";
import { ScrollView, Linking } from "react-native";
import { Link } from "expo-router";
import { Box, Text, Button, VStack, HStack } from "@tuesday-ui/ui";

const components = [
  { name: "Button", href: "/components/button" },
  { name: "TextField", href: "/components/text-field" },
  { name: "Avatar", href: "/components/avatar" },
  { name: "Badge", href: "/components/badge" },
  { name: "Checkbox", href: "/components/checkbox" },
  { name: "Toggle", href: "/components/toggle" },
  { name: "Radio", href: "/components/radio" },
  { name: "Select", href: "/components/select" },
  { name: "Chip", href: "/components/chip" },
  { name: "Divider", href: "/components/divider" },
  { name: "Spinner", href: "/components/spinner" },
  { name: "Card", href: "/components/card" },
  { name: "Section", href: "/components/section" },
  { name: "FormGroup", href: "/components/form-group" },
  { name: "ListItem", href: "/components/list-item" },
  { name: "Header", href: "/components/header" },
  { name: "SearchBar", href: "/components/search-bar" },
  { name: "EmptyState", href: "/components/empty-state" },
  { name: "AlertBanner", href: "/components/alert-banner" },
];

const screens = [
  { name: "Auth Screen", href: "/screens/auth" },
  { name: "List Screen", href: "/screens/list" },
  { name: "Detail Screen", href: "/screens/detail" },
  { name: "Settings Screen", href: "/screens/settings" },
  { name: "Profile Screen", href: "/screens/profile" },
  { name: "Dashboard Screen", href: "/screens/dashboard" },
];

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-3xl mx-auto gap-8">
        <VStack className="gap-2 pt-12">
          <Text className="text-4xl font-semibold text-foreground">
            tuesday-ui
          </Text>
          <Text className="text-lg text-foreground-muted">
            A design system built with React Native, Expo & NativeWind
          </Text>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-xl font-semibold text-foreground">Components</Text>
          <Box className="flex-row flex-wrap gap-2">
            {components.map((c) => (
              <Link key={c.name} href={c.href as any} asChild>
                <Button variant="secondary" size="sm">
                  {c.name}
                </Button>
              </Link>
            ))}
          </Box>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-xl font-semibold text-foreground">Real Estate Showcase</Text>
          <Text className="text-sm text-foreground-muted">
            Industry-specific screens built from tuesday-ui components
          </Text>
          <Link href="/showcase" asChild>
            <Button variant="primary" size="lg">Explore Showcase →</Button>
          </Link>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-xl font-semibold text-foreground">Screen Templates</Text>
          <Box className="flex-row flex-wrap gap-2">
            {screens.map((s) => (
              <Link key={s.name} href={s.href as any} asChild>
                <Button variant="outline" size="sm">
                  {s.name}
                </Button>
              </Link>
            ))}
          </Box>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
