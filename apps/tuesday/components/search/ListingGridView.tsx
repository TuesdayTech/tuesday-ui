import React from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useThemeColors } from "../../hooks/useThemeColors";
import { STATUS_COLORS } from "../../lib/search/constants";
import type { Listing } from "../../types/listing";

interface ListingGridViewProps {
  listings: Listing[];
  topInset: number;
  onListingPress?: (listing: Listing) => void;
}

export function ListingGridView({
  listings,
  topInset,
  onListingPress,
}: ListingGridViewProps) {
  const t = useThemeColors();

  return (
    <FlatList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.UID ?? String(item.id)}
      renderItem={({ item }) => (
        <ListingGridCard
          listing={item}
          t={t}
          onPress={onListingPress ? () => onListingPress(item) : undefined}
        />
      )}
      columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
      contentContainerStyle={{
        paddingTop: topInset,
        paddingBottom: 120,
        gap: 10,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ── ListingGridCard ──────────────────────────────────────────────────

interface ListingGridCardProps {
  listing: Listing;
  t: ReturnType<typeof useThemeColors>;
  onPress?: () => void;
}

function ListingGridCard({ listing, t, onPress }: ListingGridCardProps) {
  const statusColor =
    STATUS_COLORS[listing.StandardStatus ?? ""] ?? "#666666";

  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];

  const priceText = listing.CurrentPrice
    ? `$${listing.CurrentPrice.toLocaleString()}`
    : listing.RoundedPrice ?? "N/A";

  const details: string[] = [];
  if (listing.BedroomsTotal) details.push(`${listing.BedroomsTotal} bd`);
  if (listing.BathroomsTotalInteger)
    details.push(`${listing.BathroomsTotalInteger} ba`);
  if (listing.LivingArea)
    details.push(`${listing.LivingArea.toLocaleString()} sqft`);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: t.backgroundSecondary,
      }}
    >
      {/* Photo */}
      <View style={{ height: 140, backgroundColor: t.backgroundTertiary }}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: t.foregroundSubtle,
                fontFamily: "GeistSans",
                fontSize: 12,
              }}
            >
              No photo
            </Text>
          </View>
        )}

        {/* Status badge */}
        {listing.StandardStatus && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: statusColor,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "GeistSans-Medium",
                fontSize: 10,
              }}
            >
              {listing.StandardStatus}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 10, gap: 2 }}>
        <Text
          style={{
            color: t.foreground,
            fontFamily: "GeistSans-SemiBold",
            fontSize: 16,
          }}
          numberOfLines={1}
        >
          {priceText}
        </Text>
        {details.length > 0 && (
          <Text
            style={{
              color: t.foregroundMuted,
              fontFamily: "GeistSans",
              fontSize: 13,
            }}
            numberOfLines={1}
          >
            {details.join(" \u00B7 ")}
          </Text>
        )}
        {listing.UnparsedAddress && (
          <Text
            style={{
              color: t.foregroundSubtle,
              fontFamily: "GeistSans",
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            {listing.UnparsedAddress}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
