import React, { memo } from "react";
import { View, Text, useColorScheme } from "react-native";
import { getPinConfig, brightenColor } from "../../lib/search/constants";
import type { Listing } from "../../types/listing";

interface ListingMarkerProps {
  listing: Listing;
}

export const ListingMarker = memo(function ListingMarker({
  listing,
}: ListingMarkerProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const config = getPinConfig(listing.StandardStatus);
  const bg = isDark ? config.bg.dark : config.bg.light;
  const textColor = isDark ? config.text.dark : config.text.light;
  const strokeColor = brightenColor(bg, 0.6);
  const price = listing.RoundedPrice ?? "";

  return (
    <View style={{ alignItems: "center" }}>
      {/* Badge body */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: 4,
          paddingHorizontal: 3,
          height: 22,
          borderWidth: 1,
          borderColor: strokeColor,
        }}
      >
        {/* Emoji */}
        <Text
          style={{
            fontSize: 11,
            lineHeight: 14,
            includeFontPadding: false,
          }}
          allowFontScaling={false}
        >
          {config.emoji}
        </Text>
        {/* Price */}
        {price !== "" && (
          <Text
            style={{
              color: textColor,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 14,
              marginLeft: 1,
              includeFontPadding: false,
            }}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {price}
          </Text>
        )}
      </View>

      {/* Triangle pointer */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 6,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: bg,
          marginTop: -1,
        }}
      />
    </View>
  );
});
