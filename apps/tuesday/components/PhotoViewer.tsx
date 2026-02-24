import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "phosphor-react-native";
import { useThemeColors } from "../hooks/useThemeColors";

// Fixed aspect ratio for consistent layout — photos fill width, height adapts
const PHOTO_ASPECT_RATIO = 4 / 3;
const PHOTO_GAP = 2;

interface PhotoViewerProps {
  photoUrls: string[];
  startIndex: number;
  onClose: () => void;
}

export function PhotoViewer({
  photoUrls,
  startIndex,
  onClose,
}: PhotoViewerProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoHeight = width / PHOTO_ASPECT_RATIO;
  const listRef = useRef<FlatList>(null);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: photoHeight + PHOTO_GAP,
      offset: (photoHeight + PHOTO_GAP) * index,
      index,
    }),
    [photoHeight],
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <View
        style={{
          width,
          height: photoHeight,
          marginBottom: PHOTO_GAP,
          backgroundColor: "#111",
        }}
      >
        <Image
          source={{ uri: item }}
          style={{ width, height: photoHeight }}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
      </View>
    ),
    [width, photoHeight],
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
          {photoUrls.length} Photos
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

      {/* Virtualized photo list */}
      <FlatList
        ref={listRef}
        data={photoUrls}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}
