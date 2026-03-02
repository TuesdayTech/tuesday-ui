import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Rows, GearSix } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ListingDetailCard } from "../../components/listings/ListingDetailCard";
import { PhotoViewer } from "../../components/PhotoViewer";
import { useInfiniteFeed } from "../../hooks/use-feed";
import { useAuth } from "../../providers/auth-provider";

// --- Main screen ---

export default function FeedScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  const scrollY = useSharedValue(0);
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";

  const handleAgentPress = useCallback((uid: string) => {
    router.push(`/agent/${uid}`);
  }, [router]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFeed({ profileUid });

  const listings = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.listings) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.UID ?? item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      setContainerHeight(e.nativeEvent.layout.height);
    },
    [],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;

      // Track current listing for image virtualization
      if (containerHeight > 0) {
        const idx = Math.round(e.nativeEvent.contentOffset.y / containerHeight);
        setCurrentListingIndex(idx);
      }

      // Prefetch next page when near the end
      if (containerHeight > 0 && hasNextPage && !isFetchingNextPage) {
        const contentHeight = listings.length * containerHeight;
        const scrollOffset = e.nativeEvent.contentOffset.y + containerHeight;
        if (scrollOffset > contentHeight - containerHeight * 2) {
          fetchNextPage();
        }
      }
    },
    [containerHeight, hasNextPage, isFetchingNextPage, listings.length, fetchNextPage],
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (containerHeight === 0) return { opacity: 1 };

    const fadeStart = containerHeight * 1.7;
    const fadeEnd = containerHeight * 1.9;

    return {
      opacity: interpolate(
        scrollY.value,
        [fadeStart, fadeEnd],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const [viewer, setViewer] = useState<{
    listingIndex: number;
    photoUrls: string[];
    startIndex: number;
  } | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }} onLayout={onLayout}>
      {/* Loading state */}
      {isLoading && containerHeight > 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={t.foregroundMuted} />
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 15,
              color: t.foregroundMuted,
              marginTop: 12,
            }}
          >
            Loading feed...
          </Text>
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && containerHeight > 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 17,
              color: t.foreground,
              textAlign: "center",
            }}
          >
            Could not load feed
          </Text>
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 15,
              color: t.foregroundMuted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {error?.message ?? "Something went wrong"}
          </Text>
        </View>
      )}

      {/* Feed */}
      {!isLoading && !isError && containerHeight > 0 && listings.length > 0 && (
        <ScrollView
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={containerHeight}
        >
          {listings.map((item, index) => (
            <ListingDetailCard
              key={item.UID ?? `listing-${item.id}`}
              listing={item}
              listingIndex={index}
              height={containerHeight}
              isNearViewport={Math.abs(index - currentListingIndex) <= 1}
              onOpenPhotoViewer={(startIndex) =>
                setViewer({
                  listingIndex: index,
                  photoUrls: item.Photos ?? [],
                  startIndex,
                })
              }
              onAgentPress={handleAgentPress}
              profileUid={profileUid}
              foreground={t.foreground}
              foregroundMuted={t.foregroundMuted}
              background={t.background}
              backgroundSecondary={t.backgroundSecondary}
              border={t.border}
            />
          ))}

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <View
              style={{
                height: 60,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color={t.foregroundMuted} />
            </View>
          )}
        </ScrollView>
      )}

      {/* Empty state */}
      {!isLoading && !isError && listings.length === 0 && containerHeight > 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 17,
              color: t.foregroundMuted,
            }}
          >
            No listings in your feed yet
          </Text>
        </View>
      )}

      {/* Floating header — no background, fades out after 2 listings */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          headerAnimatedStyle,
        ]}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 24,
            color: "#FFFFFF",
          }}
        >
          Feed
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Rows size={20} color="#FFFFFF" weight="regular" />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GearSix size={20} color="#FFFFFF" weight="regular" />
          </Pressable>
        </View>
      </Animated.View>

      {viewer && (
        <PhotoViewer
          photoUrls={viewer.photoUrls}
          startIndex={viewer.startIndex}
          onClose={() => setViewer(null)}
        />
      )}
    </View>
  );
}
