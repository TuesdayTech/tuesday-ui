import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import {
  useArea,
  useAreaListings,
  useAreaFollowMutation,
} from "../../hooks/use-area";
import { ProfileGridMenu } from "../../components/profile/ProfileGridMenu";
import { ListingsGrid } from "../../components/listings/ListingsGrid";
import { ListingViewer } from "../../components/listings/ListingViewer";
import type { Listing } from "../../types/listing";
import type { ProfileSortOrder } from "../../types/profile";

// --- Area type label mapping (from AreaType.title in SwiftUI) ---

const AREA_TYPE_LABELS: Record<string, string> = {
  Cities: "City",
  "Zip Codes": "ZIP Code",
  "Mls Areas": "MLS Area",
  County: "County",
};

function getAreaTypeLabel(type?: string): string {
  if (!type) return "";
  return AREA_TYPE_LABELS[type] ?? "";
}

// --- Stat item (matches SwiftUI menuItem) ---

function StatItem({
  value,
  label,
  accentColor,
  mutedColor,
  isLoading,
}: {
  value?: string | number | null;
  label: string;
  accentColor: string;
  mutedColor: string;
  isLoading?: boolean;
}) {
  const hasValue = value != null && value !== "";
  const displayValue = hasValue ? String(value) : "N/A";

  if (isLoading) {
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 17,
            borderRadius: 4,
            backgroundColor: mutedColor,
            opacity: 0.2,
          }}
        />
        <View
          style={{
            width: 40,
            height: 14,
            borderRadius: 4,
            backgroundColor: mutedColor,
            opacity: 0.15,
            marginTop: 4,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center" }}>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: 16,
          color: hasValue ? accentColor : mutedColor,
        }}
      >
        {displayValue}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "GeistSans",
          fontSize: 16,
          color: accentColor,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AreaProfileScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { uid, name } = useLocalSearchParams<{ uid: string; name?: string }>();
  const { profile: authProfile } = useAuth();
  const areaUid = uid ?? "";
  const profileUid = authProfile?.UID ?? "";

  // Fetch area data
  const {
    data: area,
    isLoading: isAreaLoading,
    refetch: refetchArea,
  } = useArea(areaUid);

  // Listings
  const [sortOrder, setSortOrder] = useState<ProfileSortOrder>("recent");
  const {
    data: listingsData,
    isLoading: isListingsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchListings,
  } = useAreaListings(areaUid, profileUid, sortOrder);

  const listings = useMemo(
    () =>
      (listingsData?.pages.flatMap((p) => p.listings) ??
        []) as unknown as Listing[],
    [listingsData],
  );

  // Follow — optimistic update handled in the mutation hook (cache-level)
  const followMutation = useAreaFollowMutation();
  const currentlyFollowing = area?.isFollowing ?? false;

  const handleFollowPress = () => {
    if (!profileUid || !areaUid) return;
    followMutation.mutate({
      profileUid,
      areaUid,
      follow: !currentlyFollowing,
    });
  };

  // Listing viewer
  const [listingViewer, setListingViewer] = useState<{
    visible: boolean;
    startIndex: number;
  }>({ visible: false, startIndex: 0 });

  const handleListingPress = useCallback((index: number) => {
    setListingViewer({ visible: true, startIndex: index });
  }, []);

  // Refresh
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchArea(), refetchListings()]);
    setRefreshing(false);
  }, [refetchArea, refetchListings]);

  // Pagination via parent ScrollView
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      const distanceFromEnd =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromEnd < 500 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  // Navigation from viewer
  const handleAgentPress = useCallback(
    (agentUid: string) => {
      setListingViewer({ visible: false, startIndex: 0 });
      router.push(`/agent/${agentUid}`);
    },
    [router],
  );

  const handleAreaPress = useCallback(
    (targetAreaUid: string, areaName?: string) => {
      setListingViewer({ visible: false, startIndex: 0 });
      router.push({
        pathname: "/area/[uid]",
        params: { uid: targetAreaUid, name: areaName },
      });
    },
    [router],
  );

  const displayName = area?.AreaName ?? name ?? "";
  const typeLabel = getAreaTypeLabel(area?.AreaType);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.background }}
      edges={["top"]}
    >
      {/* ── Toolbar ── */}
      {/* Centered title with back button overlay on leading edge (matches SwiftUI) */}
      <View
        style={{
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Center: area name + type */}
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 17,
            color: t.foreground,
          }}
        >
          {displayName}
        </Text>
        {typeLabel ? (
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 15,
              color: t.foregroundMuted,
              marginTop: 2,
            }}
          >
            {typeLabel}
          </Text>
        ) : null}

        {/* Back button overlay */}
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          style={{
            position: "absolute",
            left: 19,
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
        >
          <CaretLeft size={20} color={t.foreground} weight="bold" />
        </Pressable>
      </View>

      {/* ── Main content ── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ── Stats row (Active / Avg Price / Avg DOM) ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingHorizontal: 12,
            paddingTop: 24,
            paddingBottom: 12,
          }}
        >
          <StatItem
            value={area?.ListingsCount}
            label="Active"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isAreaLoading}
          />
          <StatItem
            value={area?.averagePrice}
            label="Avg. Price"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isAreaLoading}
          />
          <StatItem
            value={area?.averageDOM}
            label="Avg. DOM"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isAreaLoading}
          />
        </View>

        {/* ── Bio ── */}
        {area?.AreaBio ? (
          <Text
            style={{
              fontFamily: "GeistSans-Light",
              fontSize: 12,
              color: t.foreground,
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            {area.AreaBio}
          </Text>
        ) : null}

        {/* ── Buttons row ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 21,
          }}
        >
          {/* Follow / Following button */}
          <Pressable
            onPress={handleFollowPress}
            disabled={isAreaLoading || followMutation.isPending}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 8,
              borderWidth: currentlyFollowing ? 1.5 : 0,
              borderColor: t.foreground,
              backgroundColor: currentlyFollowing
                ? t.background
                : t.foreground,
              alignItems: "center",
              justifyContent: "center",
              opacity: isAreaLoading ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 13,
                color: currentlyFollowing ? t.foreground : t.background,
              }}
            >
              {currentlyFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>

        </View>

        {/* ── Grid menu (sort + map) ── */}
        <ProfileGridMenu
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onMapPress={() => {
            // TODO: county → area map, others → navigate to search with area
          }}
        />

        {/* ── Listings grid ── */}
        <ListingsGrid
          listings={listings}
          isLoading={isListingsLoading}
          isFetchingMore={isFetchingNextPage}
          onListingPress={handleListingPress}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Listing viewer overlay ── */}
      {listingViewer.visible && listings.length > 0 && (
        <ListingViewer
          listings={listings}
          startIndex={listingViewer.startIndex}
          onClose={() => setListingViewer({ visible: false, startIndex: 0 })}
          onAgentPress={handleAgentPress}
          onAreaPress={handleAreaPress}
          profileUid={profileUid}
        />
      )}
    </SafeAreaView>
  );
}
