import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Avatar, Badge, Divider, Card, CardBody,
} from "@tuesday-ui/ui";

const profile = {
  name: "Rachel Green",
  office: "Compass · Minneapolis",
  bio: "Top-producing agent in the Twin Cities metro. Specializing in luxury homes, first-time buyers, and investment properties. 15+ years of experience helping families find their dream homes.",
  phone: "(612) 555-0147",
  email: "rachel@compass.com",
  links: ["instagram.com/rachelgreenhomes", "rachelgreen.com"],
  verified: true,
  isFollowing: false,
  volume: "$48M",
  startYear: 2009,
  totalSides: 312,
  avgSale: "$425K",
};

const listings = [
  { id: 1, photo: "#3B82F6", price: "$749,900", address: "2847 Woodland Ave", beds: 4, baths: 3, sqft: "2,631" },
  { id: 2, photo: "#8B5CF6", price: "$1,250,000", address: "1520 Summit Ave", beds: 5, baths: 4, sqft: "2,968" },
  { id: 3, photo: "#10B981", price: "$425,000", address: "4215 Lyndale Ave S #302", beds: 2, baths: 2, sqft: "1,362" },
  { id: 4, photo: "#F59E0B", price: "$899,000", address: "5601 Drew Ave S", beds: 4, baths: 3, sqft: "3,016" },
  { id: 5, photo: "#EF4444", price: "$575,000", address: "3201 Dupont Ave S", beds: 3, baths: 2, sqft: "1,890" },
  { id: 6, photo: "#6366F1", price: "$1,100,000", address: "2200 Lake of the Isles", beds: 5, baths: 4, sqft: "3,420" },
];

export default function AgentProfile() {
  const [following, setFollowing] = useState(false);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#0A0A0A" }} showsVerticalScrollIndicator={false}>
      <VStack className="px-3 py-4 gap-3">
        {/* Main info: avatar + stats */}
        <HStack className="items-center gap-0">
          <Avatar name={profile.name} size="xl" />
          <View style={{ flex: 1 }} />
          <VStack className="items-center">
            <Text className="text-white font-semibold">{profile.volume}</Text>
            <Text className="text-neutral-400 text-xs">since {profile.startYear}</Text>
          </VStack>
          <View style={{ width: 20 }} />
          <VStack className="items-center">
            <Text className="text-white font-semibold">{profile.totalSides}</Text>
            <Text className="text-neutral-400 text-xs">total sides</Text>
          </VStack>
          <View style={{ width: 20 }} />
          <VStack className="items-center">
            <Text className="text-white font-semibold">{profile.avgSale}</Text>
            <Text className="text-neutral-400 text-xs">avg sale</Text>
          </VStack>
          <View style={{ width: 4 }} />
        </HStack>

        {/* Name */}
        <VStack className="gap-1">
          <HStack className="gap-1 items-center">
            <Text className="text-white font-semibold text-base">{profile.name}</Text>
            {profile.verified && <Text className="text-blue-400 text-sm">✓</Text>}
          </HStack>
          <Text className="text-neutral-400 text-xs">{profile.office}</Text>
        </VStack>

        {/* Bio */}
        <Text className="text-white text-sm">{profile.bio}</Text>

        {/* Contact links */}
        <VStack className="gap-1">
          <HStack className="gap-4">
            <Text className="text-white font-medium text-sm underline">{profile.phone}</Text>
            <Text className="text-white font-medium text-sm underline">{profile.email}</Text>
          </HStack>
          <HStack className="gap-1 items-center">
            <Text className="text-blue-400 font-semibold text-sm">🔗 {profile.links[0]}</Text>
            <Text className="text-blue-400 font-semibold text-sm"> and 1 more</Text>
          </HStack>
        </VStack>

        {/* Buttons */}
        <HStack className="gap-2">
          <Button
            variant={following ? "outline" : "primary"}
            size="sm"
            className="flex-1"
            onPress={() => setFollowing(!following)}
          >
            {following ? "Following" : "Follow"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">Edit Profile</Button>
          <Button variant="outline" size="sm" className="flex-1">Share Profile</Button>
        </HStack>

        {/* Listings grid header */}
        <HStack className="justify-between items-center pt-2">
          <HStack className="gap-4">
            <Text className="text-white font-semibold text-sm">Grid</Text>
            <Text className="text-neutral-500 text-sm">Map</Text>
          </HStack>
          <HStack className="gap-2">
            <Text className="text-neutral-400 text-xs">Sort: Newest</Text>
          </HStack>
        </HStack>

        {/* Listings grid (2 columns) */}
        <Box className="flex-row flex-wrap gap-2">
          {listings.map((l) => (
            <Box key={l.id} style={{ width: "48.5%" }}>
              <VStack className="gap-0">
                <Box
                  style={{ height: 140, backgroundColor: l.photo }}
                  className="rounded-t-lg items-center justify-center"
                >
                  <Text className="text-white/20 text-3xl">🏠</Text>
                </Box>
                <VStack className="bg-neutral-900 rounded-b-lg p-2 gap-0.5">
                  <Text className="text-white font-bold text-sm">{l.price}</Text>
                  <Text className="text-neutral-400 text-xs" numberOfLines={1}>{l.address}</Text>
                  <Text className="text-neutral-500 text-xs">{l.beds}bd · {l.baths}ba · {l.sqft}sf</Text>
                </VStack>
              </VStack>
            </Box>
          ))}
        </Box>

        {/* Back */}
        <View style={{ marginTop: 16 }}>
          <Link href="/showcase" asChild>
            <Button variant="ghost" size="sm">← Back to Showcase</Button>
          </Link>
        </View>
      </VStack>
    </ScrollView>
  );
}
