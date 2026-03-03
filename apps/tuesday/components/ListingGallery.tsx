import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  type ViewToken,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { ImageSquare, Star } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface PhotoItem {
  id: string;
  uri: string;
  index: number;
}

function buildPhotos(photoUrls: string[] | undefined, listingIndex: number): PhotoItem[] {
  if (photoUrls && photoUrls.length > 0) {
    return photoUrls.map((uri, i) => ({ id: `${listingIndex}-${i}`, uri, index: i }));
  }
  return [];
}

/** Lightweight opacity pulse — single shared value, no gradient. */
function Shimmer() {
  const opacity = useSharedValue(0.04);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.12, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `rgba(255,255,255,${opacity.value})`,
  }));

  return <Animated.View style={style} />;
}

interface ListingGalleryProps {
  listingIndex: number;
  photoUrls?: string[];
  height: number;
  statusEmoji: string;
  statusText: string;
  statusColor: string;
  onOpenViewer: (startIndex: number) => void;
  isNearViewport?: boolean;
  listingType?: string;
  playlistTitle?: string;
}

export const ListingGallery = React.memo(function ListingGallery({
  listingIndex,
  photoUrls,
  height,
  statusEmoji,
  statusText,
  statusColor,
  onOpenViewer,
  isNearViewport = true,
  listingType,
  playlistTitle,
}: ListingGalleryProps) {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const photos = useRef(buildPhotos(photoUrls, listingIndex)).current;
  const totalPhotos = photos.length;
  const hasPhotos = totalPhotos > 0;

  // Track loaded photos with a ref to avoid re-rendering the entire list.
  // We only force a re-render (via setCurrentLoaded) when the CURRENT photo finishes loading
  // so we can hide its shimmer.
  const loadedRef = useRef(new Set<number>());
  const [currentLoaded, setCurrentLoaded] = useState(false);
  const currentIndexRef = useRef(0);

  const handleImageLoad = useCallback((index: number) => {
    loadedRef.current.add(index);
    // Only trigger re-render if this is the currently visible photo
    if (index === currentIndexRef.current) {
      setCurrentLoaded(true);
    }
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<PhotoItem>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
        setCurrentLoaded(loadedRef.current.has(idx));
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const renderPhoto = useCallback(
    ({ item }: { item: PhotoItem }) => (
      <Pressable
        onPress={() => onOpenViewer(item.index)}
        style={{ width, height }}
      >
        {isNearViewport ? (
          <ExpoImage
            source={{ uri: item.uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={250}
            recyclingKey={item.id}
            cachePolicy="memory-disk"
            onLoad={() => handleImageLoad(item.index)}
          />
        ) : (
          <View style={{ width, height, backgroundColor: "#111" }} />
        )}
      </Pressable>
    ),
    [width, height, isNearViewport, onOpenViewer, handleImageLoad],
  );

  const keyExtractor = useCallback((item: PhotoItem) => item.id, []);

  const pinBadge = listingType === "top_listing" ? (
    <LinearGradient
      colors={isDark ? ["#3291FF", "#B3E6FF"] : ["#0070F3", "#79D4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pinBadge}
    >
      <Text style={{ fontSize: 13 }}>👑</Text>
      <Text style={styles.pinText}>TOP LISTING</Text>
    </LinearGradient>
  ) : listingType === "important" && playlistTitle ? (
    <LinearGradient
      colors={isDark ? ["#FFC233", "#FF8C1A"] : ["#FFA500", "#E66600"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pinBadge}
    >
      <Star size={12} color="#FFFFFF" weight="fill" />
      <Text numberOfLines={1} style={styles.pinText}>
        {playlistTitle.length > 12 ? playlistTitle.slice(0, 12) + "…" : playlistTitle}
      </Text>
    </LinearGradient>
  ) : null;

  // No photos — show placeholder
  if (!hasPhotos) {
    return (
      <View style={{ height, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <ImageSquare size={40} color="#444" weight="thin" />
        <Text style={{ fontFamily: "GeistSans", fontSize: 13, color: "#555", marginTop: 8 }}>
          No photo
        </Text>

        <View style={styles.badgeRow}>
          {pinBadge}
          <View style={styles.statusBadgeInline}>
            <Text numberOfLines={1} style={{ color: statusColor }}>
              <Text style={{ fontSize: 13 }}>{statusEmoji} </Text>
              <Text style={styles.statusText}>{statusText}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ height, backgroundColor: "#111" }}>
      {/* Shimmer overlay for current photo — rendered outside FlatList for stability */}
      {isNearViewport && !currentLoaded && <Shimmer />}

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pins + Status badge row — bottom left */}
      <View style={styles.badgeRow}>
        {pinBadge}
        <View style={styles.statusBadgeInline}>
          <Text numberOfLines={1} style={{ color: statusColor }}>
            <Text style={{ fontSize: 13 }}>{statusEmoji} </Text>
            <Text style={styles.statusText}>{statusText}</Text>
          </Text>
        </View>
      </View>

      {/* Photo counter badge */}
      <View style={styles.counterBadge}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{totalPhotos}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  badgeRow: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  statusBadgeInline: {
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "GeistMono-SemiBold",
    fontSize: 15,
  },
  pinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pinText: {
    fontFamily: "GeistMono-SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  counterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: {
    color: "#FFFFFF",
    fontFamily: "GeistSans-Medium",
    fontSize: 12,
  },
});
