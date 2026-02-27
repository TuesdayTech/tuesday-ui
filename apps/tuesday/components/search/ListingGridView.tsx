import React, { useCallback } from "react";
import { ListingsGrid } from "../listings/ListingsGrid";
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
  const handlePress = useCallback(
    (index: number) => {
      if (onListingPress && listings[index]) {
        onListingPress(listings[index]);
      }
    },
    [onListingPress, listings],
  );

  return (
    <ListingsGrid
      listings={listings}
      scrollEnabled
      onListingPress={handlePress}
      contentContainerStyle={{
        paddingTop: topInset,
        paddingBottom: 120,
      }}
    />
  );
}
