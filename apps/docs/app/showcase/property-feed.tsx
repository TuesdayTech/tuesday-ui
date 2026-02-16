import React, { useState } from "react";
import { ScrollView, View, Dimensions } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Avatar, Badge, Divider,
} from "@tuesday-ui/ui";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const listings = [
  {
    id: 1,
    price: 749900,
    pricePerSqft: 285,
    address: "2847 Woodland Ave",
    unitNumber: null,
    propertySubType: "Single Family",
    city: "Minneapolis",
    state: "MN",
    zip: "55404",
    beds: 4,
    baths: 3,
    sqft: 2631,
    lotAcres: 0.18,
    dom: 5,
    status: "Active",
    agent: { name: "Rachel Green", office: "Compass", verified: true },
    color: "#3B82F6",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    price: 1250000,
    pricePerSqft: 421,
    address: "1520 Summit Ave",
    unitNumber: null,
    propertySubType: "Single Family",
    city: "St Paul",
    state: "MN",
    zip: "55105",
    beds: 5,
    baths: 4,
    sqft: 2968,
    lotAcres: 0.34,
    dom: 12,
    status: "Active",
    agent: { name: "Michael Ross", office: "Edina Realty", verified: false },
    color: "#8B5CF6",
    likes: 24,
    comments: 7,
  },
  {
    id: 3,
    price: 425000,
    pricePerSqft: 312,
    address: "4215 Lyndale Ave S",
    unitNumber: "#302",
    propertySubType: "Condo",
    city: "Minneapolis",
    state: "MN",
    zip: "55409",
    beds: 2,
    baths: 2,
    sqft: 1362,
    lotAcres: null,
    dom: 1,
    status: "Active",
    agent: { name: "Sarah Chen", office: "RE/MAX Results", verified: true },
    color: "#10B981",
    likes: 8,
    comments: 1,
  },
  {
    id: 4,
    price: 899000,
    pricePerSqft: 298,
    address: "5601 Drew Ave S",
    unitNumber: null,
    propertySubType: "Single Family",
    city: "Minneapolis",
    state: "MN",
    zip: "55410",
    beds: 4,
    baths: 3,
    sqft: 3016,
    lotAcres: 0.25,
    dom: 28,
    status: "Active",
    agent: { name: "James Wilson", office: "Coldwell Banker", verified: false },
    color: "#F59E0B",
    likes: 31,
    comments: 9,
  },
];

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

function ListingCard({ listing, isLiked, onLike }: { listing: typeof listings[0]; isLiked: boolean; onLike: () => void }) {
  return (
    <VStack className="gap-0" style={{ minHeight: SCREEN_HEIGHT * 0.85 }}>
      {/* Map placeholder */}
      <Box className="h-24 bg-neutral-800 items-center justify-center">
        <Text className="text-xs text-neutral-500 font-mono">MAP</Text>
      </Box>

      {/* Photo */}
      <Box style={{ height: SCREEN_HEIGHT * 0.28, backgroundColor: listing.color }} className="items-center justify-center relative">
        <Text className="text-white/30 text-6xl font-bold">🏠</Text>
        {/* Photo counter */}
        <Box className="absolute top-3 right-3 bg-black/60 rounded-lg px-2 py-1">
          <Text className="text-white text-xs font-semibold">1/12</Text>
        </Box>
        {/* Status badge */}
        <Box className="absolute bottom-3 left-3">
          <Badge variant="success">{listing.status}</Badge>
        </Box>
      </Box>

      {/* Info section */}
      <VStack className="px-3 py-2 gap-2 flex-1">
        {/* Price row */}
        <HStack className="items-end justify-between">
          <HStack className="items-end gap-4">
            <Text className="text-2xl font-bold text-white" style={{ fontFamily: "monospace" }}>
              {formatPrice(listing.price)}
            </Text>
            <Text className="text-base text-white pb-0.5">
              <Text className="font-bold">${listing.pricePerSqft}</Text>
              <Text className="font-normal">/sqft</Text>
            </Text>
          </HStack>
          <Text className="text-white text-2xl pb-0.5">ⓘ</Text>
        </HStack>

        {/* Details: beds · baths · sqft · lot · DOM */}
        <HStack className="gap-0 flex-wrap">
          <Text className="text-white">
            <Text className="font-bold">{listing.beds}</Text>
            <Text> beds</Text>
          </Text>
          <Text className="text-white font-bold"> · </Text>
          <Text className="text-white">
            <Text className="font-bold">{listing.baths}</Text>
            <Text> baths</Text>
          </Text>
          <Text className="text-white font-bold"> · </Text>
          <Text className="text-white">
            <Text className="font-bold">{listing.sqft.toLocaleString()}</Text>
            <Text> sqft</Text>
          </Text>
          {listing.lotAcres && (
            <>
              <Text className="text-white font-bold"> · </Text>
              <Text className="text-white">
                <Text className="font-bold">{listing.lotAcres}</Text>
                <Text> acres</Text>
              </Text>
            </>
          )}
          <Text className="text-white font-bold"> · </Text>
          <Text className="text-white">
            <Text className="font-bold">{listing.dom}</Text>
            <Text> DOM</Text>
          </Text>
        </HStack>

        {/* Address */}
        <Text className="text-white font-bold text-base">
          {listing.address}{listing.unitNumber ? ` ${listing.unitNumber}` : ""}
          {listing.propertySubType ? <Text className="text-neutral-400 font-medium">   {listing.propertySubType}</Text> : null}
        </Text>

        {/* Area links */}
        <HStack className="gap-4">
          <Text className="text-white font-medium underline">{listing.city}, {listing.state}</Text>
          <Text className="text-white font-medium underline">{listing.zip}</Text>
        </HStack>

        <View style={{ flex: 1, minHeight: 8 }} />

        {/* Agent section */}
        <VStack className="gap-0">
          <Divider />
          <HStack className="gap-2 items-center py-2">
            <Avatar name={listing.agent.name} size="sm" />
            <VStack className="gap-0">
              <Text className="text-neutral-400 text-xs">Listed by {listing.agent.office}</Text>
              <HStack className="gap-1 items-center">
                <Text className="text-white font-semibold text-sm">{listing.agent.name}</Text>
                {listing.agent.verified && <Text className="text-blue-400 text-xs">✓</Text>}
              </HStack>
            </VStack>
          </HStack>
        </VStack>

        {/* Action buttons */}
        <HStack className="gap-4 items-center pb-2">
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
              onPress={onLike}
            >
              {isLiked ? "♥" : "♡"}
            </Text>
            {listing.likes > 0 && <Text className="text-white text-xs font-semibold">{listing.likes}</Text>}
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  );
}

export default function PropertyFeed() {
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: "#0A0A0A" }}
      pagingEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Header overlay */}
      <Box className="absolute top-0 left-0 right-0 z-10 px-3" style={{ paddingTop: 50 }}>
        <HStack className="justify-between items-center">
          <Text className="text-white text-2xl font-bold">Feed</Text>
          <HStack className="gap-2">
            <Box className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white text-sm">🗺</Text>
            </Box>
            <Box className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white text-sm">☰</Text>
            </Box>
            <Box className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white text-sm">⚙</Text>
            </Box>
          </HStack>
        </HStack>
      </Box>

      <VStack className="gap-0" style={{ paddingTop: 0 }}>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isLiked={liked.includes(listing.id)}
            onLike={() => toggleLike(listing.id)}
          />
        ))}
      </VStack>

      {/* Back link at bottom */}
      <Box className="p-4">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>
      </Box>
    </ScrollView>
  );
}
