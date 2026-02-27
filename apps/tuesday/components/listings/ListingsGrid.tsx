import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ListingGridCard } from "./ListingGridCard";
import type { Listing } from "../../types/listing";

const GAP = 2;
const COLUMNS = 3;

function getCardSize() {
  const screenWidth = Dimensions.get("window").width;
  return (screenWidth - GAP * (COLUMNS - 1)) / COLUMNS;
}

// --- Skeleton loader ---

function SkeletonGrid({ cardSize }: { cardSize: number }) {
  const t = useThemeColors();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: cardSize,
            height: cardSize,
            backgroundColor: t.backgroundTertiary,
          }}
        />
      ))}
    </View>
  );
}

// --- Main component ---

interface ListingsGridProps {
  listings: Listing[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  scrollEnabled?: boolean;
  onListingPress?: (index: number) => void;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: ViewStyle;
}

export function ListingsGrid({
  listings,
  isLoading,
  isFetchingMore,
  scrollEnabled = false,
  onListingPress,
  ListHeaderComponent,
  contentContainerStyle,
}: ListingsGridProps) {
  const t = useThemeColors();
  const cardSize = useMemo(() => getCardSize(), []);

  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <ListingGridCard
        listing={item}
        size={cardSize}
        onPress={onListingPress ? () => onListingPress(index) : undefined}
      />
    ),
    [cardSize, onListingPress],
  );

  const keyExtractor = useCallback(
    (item: Listing, index: number) => item.UID ?? `${item.id}-${index}`,
    [],
  );

  if (isLoading) {
    return <SkeletonGrid cardSize={cardSize} />;
  }

  if (listings.length === 0) {
    return (
      <View style={{ height: 300, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "GeistMono",
            fontWeight: "600",
            fontSize: 15,
            color: t.foregroundSubtle,
          }}
        >
          No listings
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={listings}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={COLUMNS}
      scrollEnabled={scrollEnabled}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={contentContainerStyle}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isFetchingMore ? (
          <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <ActivityIndicator size="small" color={t.foregroundMuted} />
          </View>
        ) : null
      }
    />
  );
}
