import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "phosphor-react-native";
import { useThemeColors } from "../hooks/useThemeColors";

/** Same seed logic as ListingGallery — produces matching URLs with varied aspect ratios */
const ASPECT_RATIOS = [4 / 3, 3 / 2, 16 / 9, 1, 5 / 4, 3 / 4, 2 / 3];

function generatePhotos(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => {
    const ratio = ASPECT_RATIOS[(seed * 3 + i * 7) % ASPECT_RATIOS.length];
    return {
      id: `${seed}-${i}`,
      uri: `https://picsum.photos/seed/tuesday-${seed}-${i}/800/600`,
      index: i,
      aspectRatio: ratio,
    };
  });
}

interface PhotoViewerProps {
  listingIndex: number;
  photoCount: number;
  startIndex: number;
  onClose: () => void;
}

export function PhotoViewer({
  listingIndex,
  photoCount,
  startIndex,
  onClose,
}: PhotoViewerProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const photos = generatePhotos(photoCount, listingIndex);

  useEffect(() => {
    // Approximate offset — sum heights of photos before startIndex
    let yOffset = 0;
    for (let i = 0; i < startIndex; i++) {
      const ratio = ASPECT_RATIOS[(listingIndex * 3 + i * 7) % ASPECT_RATIOS.length];
      yOffset += width / ratio + 2;
    }
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: yOffset, animated: false });
    }, 50);
  }, [startIndex, width, listingIndex]);

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
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 18,
            color: t.foreground,
          }}
        >
          {photoCount} Photos
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

      {/* Vertical photo list */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {photos.map((photo) => {
          const photoHeight = width / photo.aspectRatio;
          return (
            <View
              key={photo.id}
              style={{
                width,
                height: photoHeight,
                marginBottom: 2,
                backgroundColor: "#111",
              }}
            >
              <Image
                source={{ uri: photo.uri }}
                style={{ width, height: photoHeight }}
                resizeMode="cover"
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
