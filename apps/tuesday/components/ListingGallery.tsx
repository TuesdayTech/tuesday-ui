import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

/** Generates photo URLs using picsum.photos with deterministic seeds */
function generatePhotos(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${seed}-${i}`,
    uri: `https://picsum.photos/seed/tuesday-${seed}-${i}/800/600`,
    index: i,
  }));
}

interface ListingGalleryProps {
  listingIndex: number;
  photoCount: number;
  height: number;
  statusEmoji: string;
  statusText: string;
  statusColor: string;
  onOpenViewer: (startIndex: number) => void;
}

export function ListingGallery({
  listingIndex,
  photoCount,
  height,
  statusEmoji,
  statusText,
  statusColor,
  onOpenViewer,
}: ListingGalleryProps) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const photos = useRef(generatePhotos(photoCount, listingIndex)).current;

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
            <Image
              source={{ uri: photo.uri }}
              style={{ width, height }}
              resizeMode="cover"
            />
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
          {currentIndex + 1}/{photoCount}
        </Text>
      </View>
    </View>
  );
}
