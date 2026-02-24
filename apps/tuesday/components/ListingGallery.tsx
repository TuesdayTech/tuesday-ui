import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";

/** Generates placeholder photo URLs using picsum.photos with deterministic seeds */
function generatePlaceholderPhotos(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${seed}-${i}`,
    uri: `https://picsum.photos/seed/tuesday-${seed}-${i}/800/600`,
    index: i,
  }));
}

function buildPhotos(photoUrls: string[] | undefined, listingIndex: number) {
  if (photoUrls && photoUrls.length > 0) {
    return photoUrls.map((uri, i) => ({ id: `${listingIndex}-${i}`, uri, index: i }));
  }
  return generatePlaceholderPhotos(5, listingIndex);
}

interface ListingGalleryProps {
  listingIndex: number;
  /** Real photo URLs from the API. Falls back to placeholders if empty/undefined. */
  photoUrls?: string[];
  /** @deprecated Use photoUrls instead. Only used for placeholder generation. */
  photoCount?: number;
  height: number;
  statusEmoji: string;
  statusText: string;
  statusColor: string;
  onOpenViewer: (startIndex: number) => void;
  /** When false, images are replaced with empty placeholders to save GPU memory */
  isNearViewport?: boolean;
}

export function ListingGallery({
  listingIndex,
  photoUrls,
  photoCount,
  height,
  statusEmoji,
  statusText,
  statusColor,
  onOpenViewer,
  isNearViewport = true,
}: ListingGalleryProps) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const photos = useRef(buildPhotos(photoUrls, listingIndex)).current;
  const totalPhotos = photos.length;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(index);
    },
    [width]
  );

  return (
    <View style={{ height, backgroundColor: "#111" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {photos.map((photo) => (
          <Pressable
            key={photo.id}
            onPress={() => onOpenViewer(photo.index)}
            style={{ width, height }}
          >
            {isNearViewport ? (
              <Image
                source={{ uri: photo.uri }}
                style={{ width, height }}
                contentFit="cover"
                transition={250}
                recyclingKey={photo.id}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={{ width, height, backgroundColor: "#111" }} />
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Status badge — bottom left */}
      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          backgroundColor: "rgba(0,0,0,0.85)",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
        }}
      >
        <Text numberOfLines={1} style={{ color: statusColor }}>
          <Text style={{ fontSize: 13 }}>{statusEmoji} </Text>
          <Text
            style={{
              fontFamily: "GeistMono-SemiBold",
              fontSize: 15,
            }}
          >
            {statusText}
          </Text>
        </Text>
      </View>

      {/* Photo counter badge */}
      <View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(0,0,0,0.55)",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "GeistSans-Medium",
            fontSize: 12,
          }}
        >
          {currentIndex + 1}/{totalPhotos}
        </Text>
      </View>
    </View>
  );
}
