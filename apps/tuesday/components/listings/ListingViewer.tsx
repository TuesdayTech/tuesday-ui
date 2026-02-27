import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ListingDetailCard } from "./ListingDetailCard";
import { PhotoViewer } from "../PhotoViewer";
import type { Listing } from "../../types/listing";

interface ListingViewerProps {
  listings: Listing[];
  startIndex: number;
  onClose: () => void;
  onAgentPress?: (uid: string) => void;
}

export function ListingViewer({
  listings,
  startIndex,
  onClose,
  onAgentPress,
}: ListingViewerProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Each listing item takes full screen minus safe area top
  const itemHeight = screenHeight - insets.top;

  const [photoViewer, setPhotoViewer] = useState<{
    photoUrls: string[];
    startIndex: number;
  } | null>(null);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <ListingDetailCard
        listing={item}
        listingIndex={index}
        height={itemHeight}
        isNearViewport={Math.abs(index - currentIndex) <= 1}
        onOpenPhotoViewer={(photoIndex) =>
          setPhotoViewer({
            photoUrls: item.Photos ?? [],
            startIndex: photoIndex,
          })
        }
        onAgentPress={onAgentPress}
        foreground={t.foreground}
        foregroundMuted={t.foregroundMuted}
        background={t.background}
        backgroundSecondary={t.backgroundSecondary}
        border={t.border}
      />
    ),
    [itemHeight, currentIndex, onAgentPress, t],
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: t.background,
        zIndex: 100,
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: t.background,
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 18,
            color: t.foreground,
          }}
        >
          {currentIndex + 1} of {listings.length}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: t.backgroundSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={20} color={t.foreground} weight="bold" />
        </Pressable>
      </View>

      {/* Listings list */}
      <FlatList
        ref={listRef}
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.UID ?? `${item.id}-${i}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Photo viewer overlay */}
      {photoViewer && (
        <PhotoViewer
          photoUrls={photoViewer.photoUrls}
          startIndex={photoViewer.startIndex}
          onClose={() => setPhotoViewer(null)}
        />
      )}
    </View>
  );
}
