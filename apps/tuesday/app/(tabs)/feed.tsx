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
import { Rows, GearSix } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ListingGallery } from "../../components/ListingGallery";
import { PhotoViewer } from "../../components/PhotoViewer";
import { useInfiniteFeed } from "../../hooks/use-feed";
import { useAuth } from "../../providers/auth-provider";
import type { Listing } from "../../types/listing";

// --- Status display config ---
// Keys match API MajorChangeType / StandardStatus values (with spaces)

// Colors from SwiftUI: geistGreen, geistAmber, geistRed, accent
const GREEN = "#2EA043";
const AMBER = "#F5A623";
const RED = "#E5484D";
const ACCENT = "#0A84FF";

const STATUS_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  // Green — active listings
  "Active":         { emoji: "🏡", label: "ACTIVE",         color: GREEN },
  "New Listing":    { emoji: "🚀", label: "NEW LISTING",    color: GREEN },
  "Price Change":   { emoji: "💰", label: "PRICE CHANGE",   color: GREEN },
  "Back On Market": { emoji: "♻️",  label: "BACK ON MARKET", color: GREEN },
  "Coming Soon":    { emoji: "⏱️",  label: "COMING SOON",    color: GREEN },

  // Amber — in process
  "Contingent": { emoji: "🤞", label: "CONTINGENT", color: AMBER },
  "Pending":    { emoji: "⏳", label: "PENDING",    color: AMBER },

  // Accent — closed
  "Closed": { emoji: "🔑", label: "CLOSED", color: ACCENT },

  // Red — off market
  "Expired":    { emoji: "☠️",  label: "EXPIRED",    color: RED },
  "Canceled":   { emoji: "🚫", label: "CANCELED",   color: RED },
  "Hold":       { emoji: "✋", label: "HOLD",       color: RED },
  "Withdrawn":  { emoji: "🪝", label: "WITHDRAWN",  color: RED },
  "Deleted":    { emoji: "🗑️",  label: "DELETED",    color: RED },
  "Incomplete": { emoji: "⚠️",  label: "INCOMPLETE", color: RED },
};

const DEFAULT_STATUS = { emoji: "❓", label: "UNKNOWN", color: "#888888" };

function getStatusConfig(item: Listing) {
  // MajorChangeType is more specific (e.g. "Price Change", "Back On Market")
  const key = item.MajorChangeType ?? item.StandardStatus;
  if (!key) return DEFAULT_STATUS;
  return STATUS_CONFIG[key] ?? DEFAULT_STATUS;
}

// --- Helpers to extract agent info from flat Listing fields ---

interface AgentSide {
  offices: string[];
  agents: string[];
}

function getListingSide(item: Listing): AgentSide {
  const offices = [item.ListAgentOfficeName, item.CoListAgentOfficeName].filter(
    (o): o is string => !!o,
  );
  const agents = [item.ListAgentFullName, item.CoListAgentFullName].filter(
    (a): a is string => !!a,
  );
  return { offices, agents };
}

function getBuyerSide(item: Listing): AgentSide | null {
  const offices = [item.BuyerAgentOfficeName, item.CoBuyerAgentOfficeName].filter(
    (o): o is string => !!o,
  );
  const agents = [item.BuyerAgentFullName, item.CoBuyerAgentFullName].filter(
    (a): a is string => !!a,
  );
  if (agents.length === 0) return null;
  return { offices, agents };
}

// --- Sub-components ---

function AgentSection({
  label,
  side,
  color,
  nameColor,
}: {
  label: string;
  side: AgentSide;
  color: string;
  nameColor: string;
}) {
  if (side.agents.length === 0) return null;

  const officeLine =
    side.offices.length > 1
      ? `${label} ${side.offices[0]} and ${side.offices[1]}`
      : side.offices.length === 1
        ? `${label} ${side.offices[0]}`
        : label;

  return (
    <View style={{ marginTop: 10 }}>
      <Text
        numberOfLines={1}
        style={{ fontFamily: "GeistSans", fontSize: 15, color }}
      >
        {officeLine}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 2 }}>
        {side.agents.length > 1 ? (
          <>
            <Text style={{ fontFamily: "GeistSans-SemiBold", color: nameColor }}>
              {side.agents[0]}
            </Text>
            <Text style={{ fontFamily: "GeistSans-Light", color: nameColor }}>
              {" & "}
            </Text>
            <Text style={{ fontFamily: "GeistSans-SemiBold", color: nameColor }}>
              {side.agents[1]}
            </Text>
          </>
        ) : (
          <Text style={{ fontFamily: "GeistSans-SemiBold", color: nameColor }}>
            {side.agents[0]}
          </Text>
        )}
      </Text>
    </View>
  );
}

function formatPrice(price: number | undefined) {
  if (!price) return "$--";
  return "$" + price.toLocaleString("en-US");
}

function formatPpsqft(price: number | undefined, sqft: number | undefined) {
  if (!price || !sqft || sqft === 0) return "";
  return "$" + Math.round(price / sqft).toLocaleString("en-US") + "/sqft";
}

function formatDom(dom: number | undefined) {
  if (dom === undefined || dom === null) return "";
  return `${dom}`;
}

// --- Main screen ---

export default function FeedScreen() {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollY = useSharedValue(0);
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFeed({ profileUid });

  const listings = useMemo(
    () => data?.pages.flatMap((p) => p.listings) ?? [],
    [data],
  );

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      setContainerHeight(e.nativeEvent.layout.height);
    },
    [],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;

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

  const mapHeight = containerHeight * 0.3;
  const galleryHeight = containerHeight * 0.3;
  const infoHeight = containerHeight * 0.4;

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
          {listings.map((item, index) => {
            const status = getStatusConfig(item);
            const listingSide = getListingSide(item);
            const buyerSide = getBuyerSide(item);
            const photoUrls = item.Photos ?? [];
            const cityState = [item.City, item.StateOrProvince]
              .filter(Boolean)
              .join(", ");

            return (
              <View
                key={item.UID ?? `listing-${item.id}`}
                style={{ height: containerHeight, backgroundColor: t.background }}
              >
                {/* Map Snapshot — 30% */}
                <View
                  style={{
                    height: mapHeight,
                    backgroundColor: t.backgroundSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: t.foregroundMuted,
                      fontFamily: "GeistSans-Medium",
                      fontSize: 13,
                    }}
                  >
                    {cityState || "Unknown location"}
                  </Text>
                </View>

                {/* Photo Gallery — 30% */}
                <ListingGallery
                  listingIndex={index}
                  photoUrls={photoUrls}
                  height={galleryHeight}
                  statusEmoji={status.emoji}
                  statusText={status.label}
                  statusColor={status.color}
                  onOpenViewer={(startIndex) =>
                    setViewer({
                      listingIndex: index,
                      photoUrls,
                      startIndex,
                    })
                  }
                />

                {/* Info — 40% */}
                <View
                  style={{
                    height: infoHeight,
                    backgroundColor: t.background,
                    paddingLeft: 12,
                    paddingTop: 16,
                  }}
                >
                  {/* Price row */}
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: "GeistMono",
                        fontWeight: "700",
                        fontSize: 28,
                        color: status.color,
                      }}
                    >
                      {formatPrice(item.CurrentPrice)}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: "GeistSans-Medium",
                        fontSize: 17,
                        color: t.foregroundMuted,
                      }}
                    >
                      {formatPpsqft(item.CurrentPrice, item.LivingArea)}
                    </Text>
                  </View>

                  {/* Stats row */}
                  <Text numberOfLines={1} style={{ color: t.foreground, fontSize: 17, marginTop: 10 }}>
                    {item.BedroomsTotal != null && (
                      <>
                        <Text style={{ fontFamily: "GeistSans-Bold" }}>{item.BedroomsTotal}</Text>
                        <Text style={{ fontFamily: "GeistSans" }}> bd </Text>
                      </>
                    )}
                    {item.BathroomsTotalInteger != null && (
                      <>
                        <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.BathroomsTotalInteger}</Text>
                        <Text style={{ fontFamily: "GeistSans" }}> ba </Text>
                      </>
                    )}
                    {item.LivingArea != null && (
                      <>
                        <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.LivingArea.toLocaleString()}</Text>
                        <Text style={{ fontFamily: "GeistSans" }}> sqft </Text>
                      </>
                    )}
                    {item.LotSizeSquareFeet != null && (
                      <>
                        <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.LotSizeSquareFeet.toLocaleString()}</Text>
                        <Text style={{ fontFamily: "GeistSans" }}> lot sqft </Text>
                      </>
                    )}
                    {item.DaysOnMarket != null && (
                      <>
                        <Text style={{ fontFamily: "GeistSans-Bold" }}>· {formatDom(item.DaysOnMarket)}</Text>
                        <Text style={{ fontFamily: "GeistSans" }}> DOM</Text>
                      </>
                    )}
                  </Text>

                  {/* Address row */}
                  <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 10 }}>
                    <Text style={{ fontFamily: "GeistSans-Bold", color: t.foreground }}>
                      {item.UnparsedAddress ?? "No address"}
                    </Text>
                    {item.PropertySubType && (
                      <Text style={{ fontFamily: "GeistSans-Medium", color: t.foregroundMuted }}>
                        {"  "}{item.PropertySubType}
                      </Text>
                    )}
                  </Text>

                  {/* Areas row */}
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                    {cityState ? (
                      <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                        {cityState}
                      </Text>
                    ) : null}
                    {item.PostalCode ? (
                      <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                        {item.PostalCode}
                      </Text>
                    ) : null}
                    {item.CountyOrParish ? (
                      <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                        {item.CountyOrParish}
                      </Text>
                    ) : null}
                  </View>

                  {/* Remarks */}
                  {item.PublicRemarks && (
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: "GeistSans",
                        fontSize: 17,
                        color: t.foreground,
                        marginTop: 10,
                      }}
                    >
                      {item.PublicRemarks}
                    </Text>
                  )}

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: t.border, marginTop: 12 }} />

                  {/* Agents */}
                  <AgentSection label="Listed by" side={listingSide} color={t.foregroundMuted} nameColor={t.foreground} />
                  {buyerSide && (
                    <AgentSection label="Sold by" side={buyerSide} color={t.foregroundMuted} nameColor={t.foreground} />
                  )}
                </View>
              </View>
            );
          })}

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
          listingIndex={viewer.listingIndex}
          photoCount={viewer.photoUrls.length || 5}
          startIndex={viewer.startIndex}
          onClose={() => setViewer(null)}
        />
      )}
    </View>
  );
}
