import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
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

type ListingStatus =
  | "active"
  | "priceChange"
  | "comingSoon"
  | "contingent"
  | "pending"
  | "closed"
  | "expired"
  | "canceled"
  | "hold";

const STATUS_CONFIG: Record<
  ListingStatus,
  { emoji: string; label: string; color: string; darkColor?: string }
> = {
  active:      { emoji: "🏡", label: "ACTIVE",       color: "#2EA043" },
  priceChange: { emoji: "💰", label: "PRICE CHANGE", color: "#2EA043" },
  comingSoon:  { emoji: "⏱️", label: "COMING SOON",  color: "#2EA043" },
  contingent:  { emoji: "🤞", label: "CONTINGENT",   color: "#F5A623" },
  pending:     { emoji: "⏳", label: "PENDING",      color: "#F5A623" },
  closed:      { emoji: "🔑", label: "CLOSED",       color: "#FFFFFF", darkColor: "#000000" },
  expired:     { emoji: "☠️", label: "EXPIRED",      color: "#E5484D" },
  canceled:    { emoji: "🚫", label: "CANCELED",     color: "#E5484D" },
  hold:        { emoji: "✋", label: "HOLD",         color: "#E5484D" },
};

interface AgentSide {
  offices: string[];
  agents: string[];
}

interface Listing {
  id: string;
  address: string;
  subtype: string;
  city: string;
  postal: string;
  county: string;
  remarks: string;
  photoCount: number;
  price: number;
  sqft: number;
  lotSqft: number;
  beds: number;
  baths: number;
  dom: number;
  status: ListingStatus;
  timeAgo: string;
  listedBy: AgentSide;
  soldBy?: AgentSide;
}

const PLACEHOLDER_LISTINGS: Listing[] = [
  { id: "1", address: "825 Sonora Road", subtype: "Single Family Residence", city: "Laguna Beach, CA", postal: "92651", county: "Orange", remarks: "Stunning ocean-view home nestled in the hills of Laguna Beach with panoramic coastline views, updated kitchen, and private backyard oasis.", photoCount: 23, price: 1330000, sqft: 1419, lotSqft: 6510, beds: 4, baths: 2, dom: 45, status: "active", timeAgo: "2h", listedBy: { offices: ["Compass"], agents: ["Tony Stark"] } },
  { id: "2", address: "1247 Ocean Ave", subtype: "Condo/Co-op", city: "Santa Monica, CA", postal: "90401", county: "Los Angeles", remarks: "Luxury beachfront condo with floor-to-ceiling windows, designer finishes throughout, and direct access to the Santa Monica Pier.", photoCount: 18, price: 2150000, sqft: 2340, lotSqft: 5200, beds: 5, baths: 4, dom: 12, status: "priceChange", timeAgo: "15m", listedBy: { offices: ["The Agency", "Keller Williams"], agents: ["Natasha Romanoff", "Pepper Potts"] } },
  { id: "3", address: "4501 Collins Ave #3204", subtype: "Condo/Co-op", city: "Miami, FL", postal: "33140", county: "Miami-Dade", remarks: "Modern high-rise living in the heart of Miami Beach with resort-style amenities, ocean views from every room, and marble finishes.", photoCount: 31, price: 875000, sqft: 1650, lotSqft: 4800, beds: 3, baths: 2, dom: 67, status: "comingSoon", timeAgo: "1d", listedBy: { offices: ["Douglas Elliman"], agents: ["Bruce Banner"] } },
  { id: "4", address: "152 W 57th St #42B", subtype: "Condo/Co-op", city: "New York, NY", postal: "10019", county: "Manhattan", remarks: "Billionaires' Row residence with Central Park views, white-glove service, private elevator entry, and Michelin-star dining on-site.", photoCount: 15, price: 3200000, sqft: 1890, lotSqft: 2100, beds: 3, baths: 3, dom: 8, status: "contingent", timeAgo: "5h", listedBy: { offices: ["Sotheby's International"], agents: ["Steve Rogers"] } },
  { id: "5", address: "3841 N Greenview Ave", subtype: "Single Family Residence", city: "Chicago, IL", postal: "60613", county: "Cook", remarks: "Classic Chicago brick home in Lakeview with original hardwood floors, updated systems, spacious yard, and a two-car garage.", photoCount: 22, price: 425000, sqft: 1780, lotSqft: 5500, beds: 4, baths: 2, dom: 92, status: "pending", timeAgo: "3d", listedBy: { offices: ["Coldwell Banker"], agents: ["Wanda Maximoff"] } },
  { id: "6", address: "9102 Meadow Lane", subtype: "Single Family Residence", city: "Houston, TX", postal: "77063", county: "Harris", remarks: "Spacious family home in a quiet cul-de-sac with a newly remodeled kitchen, resort-style pool, and mature oak trees throughout.", photoCount: 27, price: 385000, sqft: 2210, lotSqft: 7200, beds: 4, baths: 3, dom: 31, status: "closed", timeAgo: "7d", listedBy: { offices: ["RE/MAX", "Century 21"], agents: ["Clint Barton", "Scott Lang"] }, soldBy: { offices: ["eXp Realty"], agents: ["Peter Parker"] } },
  { id: "7", address: "714 Queen Anne Ave N", subtype: "Townhouse", city: "Seattle, WA", postal: "98109", county: "King", remarks: "Contemporary Queen Anne townhouse with rooftop deck, Space Needle views, chef's kitchen, and walkable to all of Lower Queen Anne.", photoCount: 19, price: 1075000, sqft: 1960, lotSqft: 4100, beds: 3, baths: 2, dom: 120, status: "expired", timeAgo: "14d", listedBy: { offices: ["Windermere Real Estate"], agents: ["Thor Odinson"] } },
  { id: "8", address: "2208 Belmont Blvd", subtype: "Single Family Residence", city: "Nashville, TN", postal: "37212", county: "Davidson", remarks: "Charming Belmont Blvd craftsman with original character, open floor plan, fenced yard, and walking distance to Music Row.", photoCount: 25, price: 650000, sqft: 2450, lotSqft: 8900, beds: 5, baths: 3, dom: 5, status: "active", timeAgo: "45m", listedBy: { offices: ["Village Real Estate"], agents: ["Carol Danvers"] } },
  { id: "9", address: "560 Peachtree St NE #4102", subtype: "Condo/Co-op", city: "Atlanta, GA", postal: "30308", county: "Fulton", remarks: "Midtown Atlanta penthouse with skyline views, concierge service, rooftop pool, and steps from Piedmont Park and the BeltLine.", photoCount: 20, price: 540000, sqft: 1820, lotSqft: 6100, beds: 4, baths: 2, dom: 58, status: "canceled", timeAgo: "6d", listedBy: { offices: ["Berkshire Hathaway"], agents: ["Sam Wilson"] } },
  { id: "10", address: "1830 Blake St", subtype: "Townhouse", city: "Denver, CO", postal: "80202", county: "Denver", remarks: "Industrial-chic LoDo townhouse near Coors Field with exposed brick, smart home features, private garage, and rooftop entertaining.", photoCount: 16, price: 725000, sqft: 1540, lotSqft: 3800, beds: 3, baths: 2, dom: 22, status: "hold", timeAgo: "50m", listedBy: { offices: ["LIV Sotheby's", "Compass"], agents: ["Bucky Barnes", "Milly Bobby Brown"] } },
];

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
  const officeLine =
    side.offices.length > 1
      ? `${label} ${side.offices[0]} and ${side.offices[1]}`
      : `${label} ${side.offices[0]}`;

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

function formatPrice(price: number) {
  return "$" + price.toLocaleString("en-US");
}

function formatPpsqft(price: number, sqft: number) {
  return "$" + Math.round(price / sqft).toLocaleString("en-US") + "/sqft";
}

export default function FeedScreen() {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollY = useSharedValue(0);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      setContainerHeight(e.nativeEvent.layout.height);
    },
    []
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    []
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
        Extrapolation.CLAMP
      ),
    };
  });

  const [viewer, setViewer] = useState<{
    listingIndex: number;
    photoCount: number;
    startIndex: number;
  } | null>(null);

  const mapHeight = containerHeight * 0.3;
  const galleryHeight = containerHeight * 0.3;
  const infoHeight = containerHeight * 0.4;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }} onLayout={onLayout}>
      {containerHeight > 0 && (
        <ScrollView
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          snapToInterval={containerHeight}
        >
          {PLACEHOLDER_LISTINGS.map((item) => (
            <View
              key={item.id}
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
                  {item.city}
                </Text>
              </View>

              {/* Photo Gallery — 30% */}
              <ListingGallery
                listingIndex={Number(item.id)}
                photoCount={item.photoCount}
                height={galleryHeight}
                statusEmoji={STATUS_CONFIG[item.status].emoji}
                statusText={`${STATUS_CONFIG[item.status].label} · ${item.timeAgo}`}
                statusColor={STATUS_CONFIG[item.status].color}
                onOpenViewer={(startIndex) =>
                  setViewer({
                    listingIndex: Number(item.id),
                    photoCount: item.photoCount,
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
                {/* Price row */}
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "GeistMono",
                      fontWeight: "700",
                      fontSize: 28,
                      color: STATUS_CONFIG[item.status].color,
                    }}
                  >
                    {formatPrice(item.price)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "GeistSans-Medium",
                      fontSize: 17,
                      color: t.foregroundMuted,
                    }}
                  >
                    {formatPpsqft(item.price, item.sqft)}
                  </Text>
                </View>

                {/* Stats row */}
                <Text numberOfLines={1} style={{ color: t.foreground, fontSize: 17, marginTop: 10 }}>
                  <Text style={{ fontFamily: "GeistSans-Bold" }}>{item.beds}</Text>
                  <Text style={{ fontFamily: "GeistSans" }}> bd </Text>
                  <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.baths}</Text>
                  <Text style={{ fontFamily: "GeistSans" }}> ba </Text>
                  <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.sqft.toLocaleString()}</Text>
                  <Text style={{ fontFamily: "GeistSans" }}> sqft </Text>
                  <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.lotSqft.toLocaleString()}</Text>
                  <Text style={{ fontFamily: "GeistSans" }}> lot sqft </Text>
                  <Text style={{ fontFamily: "GeistSans-Bold" }}>· {item.dom}</Text>
                  <Text style={{ fontFamily: "GeistSans" }}> DOM</Text>
                </Text>

                {/* Address row */}
                <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 10 }}>
                  <Text style={{ fontFamily: "GeistSans-Bold", color: t.foreground }}>
                    {item.address}
                  </Text>
                  <Text style={{ fontFamily: "GeistSans-Medium", color: t.foregroundMuted }}>
                    {"  "}{item.subtype}
                  </Text>
                </Text>

                {/* Areas row */}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                  <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                    {item.city}
                  </Text>
                  <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                    {item.postal}
                  </Text>
                  <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: t.foreground, textDecorationLine: "underline" }}>
                    {item.county}
                  </Text>
                </View>

                {/* Remarks */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "GeistSans",
                    fontSize: 17,
                    color: t.foreground,
                    marginTop: 10,
                  }}
                >
                  {item.remarks}
                </Text>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: t.border, marginTop: 12 }} />

                {/* Agents */}
                <AgentSection label="Listed by" side={item.listedBy} color={t.foregroundMuted} nameColor={t.foreground} />
                {item.soldBy && (
                  <AgentSection label="Sold by" side={item.soldBy} color={t.foregroundMuted} nameColor={t.foreground} />
                )}
              </View>
            </View>
          ))}
        </ScrollView>
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
          photoCount={viewer.photoCount}
          startIndex={viewer.startIndex}
          onClose={() => setViewer(null)}
        />
      )}
    </View>
  );
}
