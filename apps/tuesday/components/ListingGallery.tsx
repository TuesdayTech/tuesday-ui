import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

function buildPhotos(photoUrls: string[] | undefined, listingIndex: number) {
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
  }, []);

  const style = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `rgba(255,255,255,${opacity.value})`,
  }));

  return <Animated.View style={style} />;
}

interface ListingGalleryProps {
  listingIndex: number;
  /** Real photo URLs from the API. Shows "No photo" placeholder if empty/undefined. */
  photoUrls?: string[];
  height: number;
  statusEmoji: string;
  statusText: string;
  statusColor: string;
  onOpenViewer: (startIndex: number) => void;
  /** When false, images are replaced with empty placeholders to save GPU memory */
  isNearViewport?: boolean;
  /** Listing type: "top_listing", "important", or undefined for normal */
  listingType?: string;
  /** Playlist title — shown as pin text when listingType is "important" */
  playlistTitle?: string;
}

export function ListingGallery({
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

  // Track loaded state per photo index
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const handleImageLoad = useCallback((index: number) => {
    setLoadedSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(index);
    },
    [width],
  );

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

        {/* Pins + Status badge row */}
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
              <>
                {!loadedSet.has(photo.index) && photo.index === currentIndex && (
                  <Shimmer />
                )}
                <ExpoImage
                  source={{ uri: photo.uri }}
                  style={{ width, height }}
                  contentFit="cover"
                  transition={250}
                  recyclingKey={photo.id}
                  cachePolicy="memory-disk"
                  onLoad={() => handleImageLoad(photo.index)}
                />
              </>
            ) : (
              <View style={{ width, height, backgroundColor: "#111" }} />
            )}
          </Pressable>
        ))}
      </ScrollView>

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
}

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
