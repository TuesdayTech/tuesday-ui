import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
  type ViewToken,
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
import type { Listing } from "../../types/listing";

// --- Main screen ---

export default function FeedScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  const scrollY = useSharedValue(0);
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";

  const handleAgentPress = useCallback((uid: string) => {
    router.push(`/agent/${uid}`);
  }, [router]);

  const handleAreaPress = useCallback((areaUid: string, areaName?: string) => {
    router.push({
      pathname: "/area/[uid]",
      params: { uid: areaUid, name: areaName },
    });
  }, [router]);

  const handleMapPress = useCallback((listing: Listing) => {
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
    const seen = new Set<string | number>();
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

  // Only update scrollY shared value for header fade animation.
  // Current index tracking moved to onViewableItemsChanged (no state updates per frame).
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollY],
  );

  // Track current listing via viewability — fires only when the visible item actually changes.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Listing>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentListingIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

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

  // Stable callback for opening the photo viewer — takes listingIndex + startIndex
  // so it doesn't create a new closure per card.
  const handleOpenPhotoViewer = useCallback(
    (listingIndex: number, startIndex: number) => {
      const item = listings[listingIndex];
      if (!item) return;
      setViewer({
        listingIndex,
        photoUrls: item.Photos ?? [],
        startIndex,
      });
    },
    [listings],
  );

  // FlatList config for fixed-height paging
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: containerHeight,
      offset: containerHeight * index,
      index,
    }),
    [containerHeight],
  );

  const keyExtractor = useCallback(
    (item: Listing) => item.UID ?? `listing-${item.id}`,
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <ListingDetailCard
        listing={item}
        listingIndex={index}
        height={containerHeight}
        isNearViewport={Math.abs(index - currentListingIndex) <= 1}
        isActive={index === currentListingIndex}
        isDark={isDark}
        onOpenPhotoViewer={handleOpenPhotoViewer}
        onAgentPress={handleAgentPress}
        onAreaPress={handleAreaPress}
        onMapPress={handleMapPress}
        profileUid={profileUid}
        foreground={t.foreground}
        foregroundMuted={t.foregroundMuted}
        background={t.background}
        backgroundSecondary={t.backgroundSecondary}
        border={t.border}
      />
    ),
    [
      containerHeight,
      currentListingIndex,
      isDark,
      handleOpenPhotoViewer,
      handleAgentPress,
      handleAreaPress,
      handleMapPress,
      profileUid,
      t.foreground,
      t.foregroundMuted,
      t.background,
      t.backgroundSecondary,
      t.border,
    ],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View
          style={{
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="small" color={t.foregroundMuted} />
        </View>
      ) : null,
    [isFetchingNextPage, t.foregroundMuted],
  );

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
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={containerHeight}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={handleEndReached}
          onEndReachedThreshold={1}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={1}
          removeClippedSubviews
          ListFooterComponent={ListFooter}
        />
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
