import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Pressable,
  FlatList,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
  onAreaPress?: (uid: string, name?: string) => void;
  profileUid?: string;
}

export function ListingViewer({
  listings,
  startIndex,
  onClose,
  onAgentPress,
  onAreaPress,
  profileUid,
}: ListingViewerProps) {
  const t = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const [photoViewer, setPhotoViewer] = useState<{
    photoUrls: string[];
    startIndex: number;
  } | null>(null);

  const handleMapPress = useCallback(
    (listing: Listing) => {
      const lat = parseFloat(listing.Latitude ?? "");
      const lng = parseFloat(listing.Longitude ?? "");
      if (isNaN(lat) || isNaN(lng)) return;
      router.push({
        pathname: "/listing-map",
        params: {
          lat: String(lat),
          lng: String(lng),
          standardStatus: listing.StandardStatus ?? "Active",
          roundedPrice: listing.RoundedPrice ?? "",
          address: listing.UnparsedAddress ?? "",
        },
      });
    },
    [router],
  );

  const itemHeight = screenHeight;

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
        onAreaPress={onAreaPress}
        onMapPress={handleMapPress}
        profileUid={profileUid}
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

      {/* Full-screen listings list */}
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

      {/* Floating close button */}
      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={{
          position: "absolute",
          top: insets.top + 8,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.4)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <X size={20} color="#FFFFFF" weight="bold" />
      </Pressable>

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
