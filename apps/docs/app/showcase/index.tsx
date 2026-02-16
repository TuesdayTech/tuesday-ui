import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Button, VStack, Box, Badge } from "@tuesday-ui/ui";

const showcaseScreens = [
  { name: "Property Feed", href: "/showcase/property-feed", desc: "Scrollable property cards with photos, prices & stats" },
  { name: "Property Search", href: "/showcase/property-search", desc: "Search bar with filter chips and results list" },
  { name: "Listing Detail", href: "/showcase/listing-detail", desc: "Full property detail page with agent contact" },
  { name: "Inbox", href: "/showcase/inbox", desc: "Chat/message inbox with unread badges" },
  { name: "Agent Profile", href: "/showcase/agent-profile", desc: "Agent profile with stats, listings & reviews" },
  { name: "Market Dashboard", href: "/showcase/market-dashboard", desc: "Market insights with stat cards & activity" },
];

export default function ShowcaseIndex() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-3xl mx-auto gap-8">
        <VStack className="gap-2 pt-12">
          <Link href="/" asChild>
            <Button variant="ghost" size="sm">← Back to docs</Button>
          </Link>
          <Text className="text-3xl font-semibold text-foreground">
            Real Estate Showcase
          </Text>
          <Text className="text-base text-foreground-muted">
            Industry-specific screens built entirely from tuesday-ui components
          </Text>
        </VStack>

        <VStack className="gap-3">
          {showcaseScreens.map((s) => (
            <Link key={s.name} href={s.href as any} asChild>
              <Button variant="outline" size="lg">
                <Box className="flex-1">
                  <Text className="text-base font-medium text-foreground">{s.name}</Text>
                  <Text className="text-sm text-foreground-muted">{s.desc}</Text>
                </Box>
              </Button>
            </Link>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
