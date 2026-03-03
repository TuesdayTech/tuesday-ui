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
import { CaretLeft, MapPin, Pencil } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import {
  usePlaylist,
  usePlaylistListings,
  usePlaylistFollowMutation,
} from "../../hooks/use-playlists";
import { ProfileGridMenu } from "../../components/profile/ProfileGridMenu";
import { ListingsGrid } from "../../components/listings/ListingsGrid";
import { ListingViewer } from "../../components/listings/ListingViewer";
import { STATUS_EMOJI } from "../../lib/search/constants";
import type { Listing } from "../../types/listing";
import type { ProfileSortOrder } from "../../types/profile";
import type { Playlist } from "../../types/playlist";

// ─── Helpers ────────────────────────────────────────────────

/** Extract display name from a UID by dropping the 5-char prefix. */
function displayNameFromUid(uid: string): string {
  return uid.length > 5 ? uid.slice(5) : uid;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESI: "Residential",
  RLSE: "Rental",
  LAND: "Land",
  COMM: "Commercial",
  CONDO: "Condo",
  MULTI: "Multi-Family",
  FARM: "Farm",
  MOBI: "Mobile",
};

function formatPropertyType(type: string, subtypeCount: number): string {
  const label = PROPERTY_TYPE_LABELS[type] ?? type;
  return subtypeCount > 0 ? `${label} (${subtypeCount})` : label;
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value}`;
}

function formatArea(value: number): string {
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K sqft`;
  }
  return `${value} sqft`;
}

// ─── Filter Pills builder ───────────────────────────────────

interface FilterPill {
  key: string;
  label: string;
}

function buildFilterPills(playlist: Playlist): FilterPill[] {
  const pills: FilterPill[] = [];

  // Property types
  if (playlist.propertyTypesWithSubTypes?.length) {
    for (const pt of playlist.propertyTypesWithSubTypes) {
      pills.push({
        key: `pt-${pt.type}`,
        label: formatPropertyType(pt.type, pt.values.length),
      });
    }
  }

  // Price range
  if (playlist.minPrice != null || playlist.maxPrice != null) {
    const min = playlist.minPrice;
    const max = playlist.maxPrice;
    if (min && max) {
      pills.push({ key: "price", label: `${formatPrice(min)}-${formatPrice(max)}` });
    } else if (min) {
      pills.push({ key: "price", label: `${formatPrice(min)}+` });
    } else if (max) {
      pills.push({ key: "price", label: `< ${formatPrice(max)}` });
    }
  }

  // Statuses
  if (playlist.standardStatuses?.length) {
    for (const s of playlist.standardStatuses) {
      const emoji = STATUS_EMOJI[s] ?? "";
      pills.push({ key: `status-${s}`, label: `${emoji} ${s}`.trim() });
    }
  }

  // Bedrooms
  if (playlist.minBedrooms != null || playlist.maxBedrooms != null) {
    const min = playlist.minBedrooms;
    const max = playlist.maxBedrooms;
    if (min && max) {
      pills.push({ key: "beds", label: `${min}-${max} beds` });
    } else if (min) {
      pills.push({ key: "beds", label: `${min}+ beds` });
    } else if (max) {
      pills.push({ key: "beds", label: `up to ${max} beds` });
    }
  }

  // Bathrooms
  if (playlist.minBathrooms != null || playlist.maxBathrooms != null) {
    const min = playlist.minBathrooms;
    const max = playlist.maxBathrooms;
    if (min && max) {
      pills.push({ key: "baths", label: `${min}-${max} baths` });
    } else if (min) {
      pills.push({ key: "baths", label: `${min}+ baths` });
    } else if (max) {
      pills.push({ key: "baths", label: `up to ${max} baths` });
    }
  }

  // Living area
  if (playlist.minLivingArea != null || playlist.maxLivingArea != null) {
    const min = playlist.minLivingArea;
    const max = playlist.maxLivingArea;
    if (min && max) {
      pills.push({ key: "sqft", label: `${formatArea(min)}-${formatArea(max)}` });
    } else if (min) {
      pills.push({ key: "sqft", label: `${formatArea(min)}+` });
    } else if (max) {
      pills.push({ key: "sqft", label: `< ${formatArea(max)}` });
    }
  }

  // Lot size
  if (playlist.minLotSizeAcres != null || playlist.maxLotSizeAcres != null) {
    const min = playlist.minLotSizeAcres;
    const max = playlist.maxLotSizeAcres;
    if (min && max) {
      pills.push({ key: "lot", label: `${min}-${max} acres` });
    } else if (min) {
      pills.push({ key: "lot", label: `${min}+ acres` });
    } else if (max) {
      pills.push({ key: "lot", label: `< ${max} acres` });
    }
  }

  // Year built
  if (playlist.minYearBuilt != null || playlist.maxYearBuilt != null) {
    const min = playlist.minYearBuilt;
    const max = playlist.maxYearBuilt;
    if (min && max) {
      pills.push({ key: "year", label: `${min}-${max}` });
    } else if (min) {
      pills.push({ key: "year", label: `${min}+` });
    } else if (max) {
      pills.push({ key: "year", label: `built before ${max}` });
    }
  }

  return pills;
}

// ─── Location pills builder ─────────────────────────────────

interface LocationPill {
  key: string;
  label: string;
  kind: "area" | "boundary";
}

function buildLocationPills(playlist: Playlist): LocationPill[] {
  const pills: LocationPill[] = [];

  for (const uid of playlist.cityUIDs ?? []) {
    pills.push({ key: `city-${uid}`, label: displayNameFromUid(uid), kind: "area" });
  }
  for (const uid of playlist.postalCodeUIDs ?? []) {
    pills.push({ key: `zip-${uid}`, label: displayNameFromUid(uid), kind: "area" });
  }
  for (const uid of playlist.countyUIDs ?? []) {
    pills.push({ key: `county-${uid}`, label: displayNameFromUid(uid), kind: "area" });
  }

  if (playlist.boundaries) {
    pills.push({ key: "boundary", label: "Custom area", kind: "boundary" });
  }

  return pills;
}

// ─── Client pills builder ───────────────────────────────────

interface ClientPill {
  key: string;
  label: string;
}

function buildClientPills(playlist: Playlist): ClientPill[] {
  const pills: ClientPill[] = [];

  if (playlist.clients?.length) {
    for (const client of playlist.clients) {
      const name = [client.name, client.surname].filter(Boolean).join(" ");
      const typeSuffix = client.type ? ` (${client.type})` : "";
      pills.push({
        key: `client-${client.UID ?? client.id}`,
        label: `${name || "Client"}${typeSuffix}`,
      });
    }
  } else if (playlist.clientName) {
    pills.push({ key: "client-name", label: playlist.clientName });
  }

  return pills;
}

// ─── Pill component ─────────────────────────────────────────

function Pill({
  label,
  color,
  bgColor,
}: {
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: bgColor,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "GeistSans-Medium",
          fontSize: 13,
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Stat item ──────────────────────────────────────────────

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

// ─── Main screen ────────────────────────────────────────────

export default function PlaylistProfileScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { profile: authProfile } = useAuth();
  const playlistUid = uid ?? "";
  const profileUid = authProfile?.UID ?? "";

  // Fetch playlist metadata
  const {
    data: playlist,
    isLoading: isPlaylistLoading,
    refetch: refetchPlaylist,
  } = usePlaylist(playlistUid, profileUid);

  // Listings
  const [sortOrder, setSortOrder] = useState<ProfileSortOrder>("recent");
  const {
    data: listingsData,
    isLoading: isListingsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchListings,
  } = usePlaylistListings(playlistUid, profileUid, sortOrder);

  const listings = useMemo(
    () =>
      (listingsData?.pages.flatMap((p) => p.listings) ?? []) as unknown as Listing[],
    [listingsData],
  );

  // Follow
  const followMutation = usePlaylistFollowMutation();
  const currentlyFollowing = playlist?.isFollowing ?? false;

  const handleFollowPress = () => {
    if (!profileUid || !playlistUid) return;
    followMutation.mutate({
      profileUid,
      playlistUid,
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
    await Promise.all([refetchPlaylist(), refetchListings()]);
    setRefreshing(false);
  }, [refetchPlaylist, refetchListings]);

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
    (areaUid: string, areaName?: string) => {
      setListingViewer({ visible: false, startIndex: 0 });
      router.push({
        pathname: "/area/[uid]",
        params: { uid: areaUid, name: areaName },
      });
    },
    [router],
  );

  // Derived UI data
  const displayTitle = playlist?.title ?? "Untitled";
  const locationPills = useMemo(
    () => (playlist ? buildLocationPills(playlist) : []),
    [playlist],
  );
  const filterPills = useMemo(
    () => (playlist ? buildFilterPills(playlist) : []),
    [playlist],
  );
  const clientPills = useMemo(
    () => (playlist ? buildClientPills(playlist) : []),
    [playlist],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.background }}
      edges={["top"]}
    >
      {/* ── Toolbar ── */}
      <View
        style={{
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 17,
            color: t.foreground,
            paddingHorizontal: 60,
          }}
        >
          {displayTitle}
        </Text>

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
        {/* ── Location pills ── */}
        {locationPills.length > 0 && (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {locationPills.map((pill) => (
                <Pill
                  key={pill.key}
                  label={pill.label}
                  color="#FFFFFF"
                  bgColor={pill.kind === "boundary" ? "#9333EA" : "#0A84FF"}
                />
              ))}
            </View>
            <Divider color={t.border} />
          </>
        )}

        {/* ── Filter pills ── */}
        {filterPills.length > 0 && (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {filterPills.map((pill) => (
                <Pill
                  key={pill.key}
                  label={pill.label}
                  color={t.foreground}
                  bgColor={t.backgroundTertiary}
                />
              ))}
            </View>
            <Divider color={t.border} />
          </>
        )}

        {/* ── Client pills ── */}
        {clientPills.length > 0 && (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {clientPills.map((pill) => (
                <Pill
                  key={pill.key}
                  label={pill.label}
                  color={t.foreground}
                  bgColor={t.backgroundSecondary}
                />
              ))}
            </View>
            <Divider color={t.border} />
          </>
        )}

        {/* ── Summary ── */}
        {playlist?.summary ? (
          <>
            <Text
              numberOfLines={3}
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foregroundMuted,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              {playlist.summary}
            </Text>
            <Divider color={t.border} />
          </>
        ) : null}

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
            value={playlist?.activeListingsCount ?? playlist?.listingsCount}
            label="Active"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isPlaylistLoading}
          />
          <StatItem
            value={playlist?.averagePrice}
            label="Avg. Price"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isPlaylistLoading}
          />
          <StatItem
            value={playlist?.averageDOM}
            label="Avg. DOM"
            accentColor={t.foreground}
            mutedColor={t.foregroundMuted}
            isLoading={isPlaylistLoading}
          />
        </View>

        {/* ── Action buttons ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 21,
            gap: 12,
          }}
        >
          {/* Edit */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/playlist/edit-filters",
                params: { uid: playlistUid },
              })
            }
            disabled={isPlaylistLoading}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 8,
              backgroundColor: t.foreground,
              alignItems: "center",
              justifyContent: "center",
              opacity: isPlaylistLoading ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 13,
                color: t.background,
              }}
            >
              Edit
            </Text>
          </Pressable>

          {/* Add to feed */}
          <Pressable
            onPress={handleFollowPress}
            disabled={isPlaylistLoading || followMutation.isPending}
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
              opacity: isPlaylistLoading ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 13,
                color: currentlyFollowing ? t.foreground : t.background,
              }}
            >
              {currentlyFollowing ? "Added to feed" : "Add to feed"}
            </Text>
          </Pressable>
        </View>

        {/* ── Grid menu (sort) ── */}
        <ProfileGridMenu
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onMapPress={() => {}}
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

// ─── Divider ────────────────────────────────────────────────

function Divider({ color }: { color: string }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color,
        marginHorizontal: 16,
        opacity: 0.3,
      }}
    />
  );
}
