import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { STATUS_COLORS, STATUS_EMOJI } from "../../lib/search/constants";
import type { Listing } from "../../types/listing";

interface ListingGridCardProps {
  listing: Listing;
  size: number;
  onPress?: () => void;
}

export function ListingGridCard({ listing, size, onPress }: ListingGridCardProps) {
  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];
  const status = listing.MajorChangeType ?? listing.StandardStatus ?? "";
  const statusColor = STATUS_COLORS[status] ?? "#666666";
  const statusEmoji = STATUS_EMOJI[status] ?? "";
  const priceLabel = listing.RoundedPrice ?? "";

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width: size, height: size }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={listing.UID ?? String(listing.id)}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            backgroundColor: "#1A1A1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 11,
              color: "#666666",
            }}
          >
            No photo
          </Text>
        </View>
      )}

      {/* Status badge — top right */}
      {(statusEmoji || priceLabel) && (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: statusColor,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 5,
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          {statusEmoji ? (
            <Text style={{ fontSize: 9 }}>{statusEmoji}</Text>
          ) : null}
          {priceLabel ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 9,
                color: "#FFFFFF",
              }}
            >
              {priceLabel}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
