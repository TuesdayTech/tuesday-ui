import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Button, VStack, HStack, Box } from "@tuesday-ui/ui";

const showcaseScreens = [
  { name: "Design Decisions", href: "/showcase/design-decisions", desc: "15 open questions for the design system — tap to decide", icon: "◆", highlight: true },
  { name: "Feed", href: "/showcase/property-feed", desc: "Full-screen paging listing cards with photos, price, details & actions", icon: "🏠" },
  { name: "Listing Detail", href: "/showcase/listing-detail", desc: "Map, photo gallery, price, specs, remarks, agent & share", icon: "📋" },
  { name: "Search", href: "/showcase/property-search", desc: "Map-based search with location filters, pills & results", icon: "🔍" },
  { name: "Profile", href: "/showcase/agent-profile", desc: "Agent profile with stats, bio, contacts & listing grid", icon: "👤" },
  { name: "Inbox", href: "/showcase/inbox", desc: "Notification feed — follows, likes, shares, playlist invites", icon: "📥" },
  { name: "Market Dashboard", href: "/showcase/market-dashboard", desc: "Market stats, recent activity & quick actions", icon: "📊" },
];

export default function ShowcaseIndex() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#0A0A0A" }} showsVerticalScrollIndicator={false}>
      <VStack className="p-6 max-w-xl mx-auto gap-8">
        <VStack className="gap-2 pt-8">
          <Link href="/" asChild>
            <Button variant="ghost" size="sm">← Back to docs</Button>
          </Link>
          <Text className="text-white text-3xl font-bold">
            Real Estate Showcase
          </Text>
          <Text className="text-neutral-400 text-base">
            Screens from the TuesdayApp real estate platform, built with tuesday-ui components
          </Text>
        </VStack>

        <VStack className="gap-3">
          {showcaseScreens.map((s) => (
            <Link key={s.name} href={s.href as any} asChild>
              <Button variant={(s as any).highlight ? "primary" : "outline"} size="lg">
                <HStack className="flex-1 gap-3 items-center">
                  <Text className="text-2xl">{s.icon}</Text>
                  <VStack className="flex-1 gap-0.5">
                    <Text className="text-white font-semibold text-base">{s.name}</Text>
                    <Text className={`text-sm ${(s as any).highlight ? "text-white/70" : "text-neutral-400"}`}>{s.desc}</Text>
                  </VStack>
                </HStack>
              </Button>
            </Link>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
