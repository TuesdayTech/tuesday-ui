import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, SearchBar, Chip, Badge,
} from "@tuesday-ui/ui";

const filterPills = [
  { label: "Active", active: true },
  { label: "$300K–$800K", active: true },
  { label: "3+ Beds", active: true },
  { label: "Single Family", active: true },
];

const recentSearches = [
  { type: "city", icon: "🏢", name: "Minneapolis, MN", subtitle: "Hennepin County" },
  { type: "zip", icon: "📍", name: "55405", subtitle: "Minneapolis, MN" },
  { type: "address", icon: "📍", name: "2847 Woodland Ave", subtitle: "Minneapolis, MN 55404" },
];

const searchResults = [
  { type: "city", icon: "🏢", name: "Minneapolis, MN", subtitle: "Hennepin County" },
  { type: "city", icon: "🏢", name: "Minnetonka, MN", subtitle: "Hennepin County" },
  { type: "zip", icon: "📍", name: "55401", subtitle: "Minneapolis, MN" },
  { type: "zip", icon: "📍", name: "55402", subtitle: "Minneapolis, MN" },
  { type: "zip", icon: "📍", name: "55403", subtitle: "Minneapolis, MN" },
];

export default function PropertySearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const showResults = query.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      {/* Map placeholder */}
      {!isFocused && (
        <Box className="flex-1 bg-neutral-800 items-center justify-center">
          <Text className="text-neutral-600 text-sm font-mono">MAP VIEW</Text>
          {/* Map pins */}
          <Box className="absolute" style={{ top: "30%", left: "25%" }}>
            <Box className="bg-white rounded-full px-2 py-0.5">
              <Text className="text-black text-xs font-bold">$425K</Text>
            </Box>
          </Box>
          <Box className="absolute" style={{ top: "45%", left: "55%" }}>
            <Box className="bg-white rounded-full px-2 py-0.5">
              <Text className="text-black text-xs font-bold">$749K</Text>
            </Box>
          </Box>
          <Box className="absolute" style={{ top: "60%", left: "35%" }}>
            <Box className="bg-white rounded-full px-2 py-0.5">
              <Text className="text-black text-xs font-bold">$899K</Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Search overlay */}
      <VStack className="absolute top-0 left-0 right-0 z-10" style={{ paddingTop: 50 }}>
        <VStack className="px-3 gap-2">
          {/* Search bar */}
          <SearchBar
            placeholder="Search location..."
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Selected locations */}
          {!isFocused && (
            <HStack className="gap-1 flex-wrap">
              <Chip selected onPress={() => {}}>Minneapolis, MN ×</Chip>
              <Chip selected onPress={() => {}}>55404 ×</Chip>
            </HStack>
          )}

          {/* Filter pills */}
          {!isFocused && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack className="gap-1">
                {filterPills.map((p) => (
                  <Chip key={p.label} selected={p.active} onPress={() => {}}>
                    {p.label}
                  </Chip>
                ))}
                <Chip onPress={() => {}}>⚙ Filters (4)</Chip>
              </HStack>
            </ScrollView>
          )}
        </VStack>

        {/* Search results overlay */}
        {isFocused && (
          <ScrollView className="flex-1 mt-2" style={{ backgroundColor: "rgba(10,10,10,0.95)", maxHeight: 500 }}>
            <VStack className="px-3 py-4 gap-6">
              {/* Current location */}
              <HStack className="gap-4 items-center">
                <Text className="text-2xl">📍</Text>
                <Text className="text-white font-medium text-sm">Current Location</Text>
              </HStack>

              {/* Recent or search results */}
              {!showResults ? (
                <VStack className="gap-3">
                  <Text className="text-neutral-500 font-semibold text-xs">Recent Searches</Text>
                  {recentSearches.map((r, i) => (
                    <HStack key={i} className="gap-4 items-center">
                      <Text className="text-2xl">{r.icon}</Text>
                      <VStack className="gap-0">
                        <Text className="text-white font-medium text-sm">{r.name}</Text>
                        <Text className="text-neutral-500 text-xs">{r.subtitle}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <VStack className="gap-4">
                  <VStack className="gap-3">
                    <Text className="text-neutral-500 font-semibold text-xs">Cities</Text>
                    {searchResults.filter(r => r.type === "city").map((r, i) => (
                      <HStack key={i} className="gap-4 items-center justify-between">
                        <HStack className="gap-4 items-center flex-1">
                          <Text className="text-2xl">{r.icon}</Text>
                          <VStack className="gap-0">
                            <Text className="text-white font-medium text-sm">{r.name}</Text>
                            <Text className="text-neutral-500 text-xs">{r.subtitle}</Text>
                          </VStack>
                        </HStack>
                        <Text className="text-white text-lg">↗</Text>
                      </HStack>
                    ))}
                  </VStack>
                  <VStack className="gap-3">
                    <Text className="text-neutral-500 font-semibold text-xs">ZIP Codes</Text>
                    {searchResults.filter(r => r.type === "zip").map((r, i) => (
                      <HStack key={i} className="gap-4 items-center justify-between">
                        <HStack className="gap-4 items-center flex-1">
                          <Text className="text-2xl">{r.icon}</Text>
                          <VStack className="gap-0">
                            <Text className="text-white font-medium text-sm">{r.name}</Text>
                            <Text className="text-neutral-500 text-xs">{r.subtitle}</Text>
                          </VStack>
                        </HStack>
                        <Text className="text-white text-lg">↗</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              )}
            </VStack>
          </ScrollView>
        )}
      </VStack>

      {/* Bottom controls */}
      {!isFocused && (
        <VStack className="absolute bottom-0 left-0 right-0 px-3 gap-3" style={{ paddingBottom: 70 }}>
          <HStack className="gap-3">
            <Box className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Text className="text-white">✋</Text>
            </Box>
            <Button variant="primary" size="sm" className="flex-1">
              Save search
            </Button>
          </HStack>
          <Box className="bg-white/10 rounded-full py-2 items-center" style={{ borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)" }}>
            <Text className="text-white font-semibold text-sm">View 247 of 1,000+ results</Text>
          </Box>
        </VStack>
      )}

      {/* Back link */}
      <Box className="absolute bottom-2 left-3">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
      </Box>
    </View>
  );
}
