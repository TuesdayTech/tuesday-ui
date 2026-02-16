import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Avatar, Badge, Divider,
} from "@tuesday-ui/ui";

const listing = {
  price: 749900,
  pricePerSqft: 285,
  address: "2847 Woodland Ave",
  unitNumber: null,
  propertySubType: "Single Family",
  city: "Minneapolis",
  state: "MN",
  zip: "55404",
  county: "Hennepin",
  beds: 4,
  baths: 3,
  sqft: 2631,
  lotAcres: 0.18,
  lotSqft: 7841,
  dom: 5,
  yearBuilt: 1922,
  status: "Active",
  photos: 24,
  remarks:
    "Beautifully updated 4-bedroom Craftsman in the heart of Seward. Original hardwood floors throughout, stunning woodwork, and a chef's kitchen with quartz countertops and stainless appliances. Primary suite with walk-in closet and updated bath. Finished lower level with family room. Fenced backyard with patio, perfect for entertaining. Steps from the Midtown Greenway and local shops.",
  listAgent: { name: "Rachel Green", office: "Compass", verified: true },
  buyAgent: null,
  likes: 12,
  comments: 3,
};

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

export default function ListingDetail() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#0A0A0A" }} showsVerticalScrollIndicator={false}>
      <VStack className="gap-0">
        {/* Map snapshot */}
        <Box className="h-28 bg-neutral-800 items-center justify-center">
          <Text className="text-xs text-neutral-500 font-mono">MAP · {listing.address}, {listing.city}</Text>
        </Box>

        {/* Photo gallery */}
        <Box style={{ height: 280, backgroundColor: "#3B82F6" }} className="items-center justify-center relative">
          <Text className="text-white/30 text-6xl font-bold">🏠</Text>
          <Box className="absolute top-3 right-3 bg-black/60 rounded-lg px-2 py-1">
            <Text className="text-white text-xs font-semibold">1/{listing.photos}</Text>
          </Box>
          <Box className="absolute bottom-3 left-3">
            <Badge variant="success">{listing.status}</Badge>
          </Box>
        </Box>

        {/* Listing info */}
        <VStack className="px-3 py-3 gap-2">
          {/* Price */}
          <HStack className="items-end justify-between">
            <HStack className="items-end gap-5">
              <Text className="text-white text-3xl font-bold" style={{ fontFamily: "monospace" }}>
                {formatPrice(listing.price)}
              </Text>
              <Text className="text-white text-base pb-1">
                <Text className="font-bold">${listing.pricePerSqft}</Text>
                <Text>/sqft</Text>
              </Text>
            </HStack>
            <Text className="text-white text-2xl pb-1">ⓘ</Text>
          </HStack>

          {/* Details */}
          <HStack className="gap-0 flex-wrap">
            <Text className="text-white"><Text className="font-bold">{listing.beds}</Text> beds</Text>
            <Text className="text-white font-bold"> · </Text>
            <Text className="text-white"><Text className="font-bold">{listing.baths}</Text> baths</Text>
            <Text className="text-white font-bold"> · </Text>
            <Text className="text-white"><Text className="font-bold">{listing.sqft.toLocaleString()}</Text> sqft</Text>
            <Text className="text-white font-bold"> · </Text>
            <Text className="text-white"><Text className="font-bold">{listing.lotAcres}</Text> acres</Text>
            <Text className="text-white font-bold"> · </Text>
            <Text className="text-white"><Text className="font-bold">{listing.dom}</Text> DOM</Text>
          </HStack>

          {/* Address */}
          <Text className="text-white font-bold text-base">
            {listing.address}
            <Text className="text-neutral-400 font-medium">   {listing.propertySubType}</Text>
          </Text>

          {/* Area */}
          <HStack className="gap-4">
            <Text className="text-white font-medium underline">{listing.city}, {listing.state}</Text>
            <Text className="text-white font-medium underline">{listing.zip}</Text>
            <Text className="text-white font-medium underline">{listing.county}</Text>
          </HStack>

          {/* Remarks */}
          <View style={{ marginTop: 8 }}>
            <Text className="text-white/80 text-sm leading-relaxed">
              {listing.remarks}
            </Text>
          </View>

          <Divider />

          {/* Agent section */}
          <HStack className="gap-2 items-center py-1">
            <Avatar name={listing.listAgent.name} size="sm" />
            <VStack className="gap-0 flex-1">
              <Text className="text-neutral-400 text-xs">Listed by {listing.listAgent.office}</Text>
              <HStack className="gap-1 items-center">
                <Text className="text-white font-semibold">{listing.listAgent.name}</Text>
                {listing.listAgent.verified && <Text className="text-blue-400 text-xs">✓</Text>}
              </HStack>
            </VStack>
          </HStack>

          {/* Action buttons */}
          <HStack className="gap-4 items-center py-2">
            <Button variant="primary" size="sm" className="flex-1">
              ✈ Share
            </Button>
            <Text className="text-white text-xl">📅</Text>
            <HStack className="gap-1 items-center">
              <Text className="text-white text-xl">💬</Text>
              {listing.comments > 0 && <Text className="text-white text-xs font-semibold">{listing.comments}</Text>}
            </HStack>
            <HStack className="gap-1 items-center">
              <Text
                className={`text-xl ${isLiked ? "text-red-500" : "text-white"}`}
                onPress={() => setIsLiked(!isLiked)}
              >
                {isLiked ? "♥" : "♡"}
              </Text>
              <Text className="text-white text-xs font-semibold">{isLiked ? listing.likes + 1 : listing.likes}</Text>
            </HStack>
          </HStack>

          {/* Back */}
          <View style={{ marginTop: 16 }}>
            <Link href="/showcase" asChild>
              <Button variant="ghost" size="sm">← Back to Showcase</Button>
            </Link>
          </View>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
