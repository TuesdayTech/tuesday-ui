import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CaretLeft, ShareNetwork, Heart } from "phosphor-react-native";
import MapView, { Marker } from "react-native-maps";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import { useListing } from "../../hooks/use-listing";
import { ListingGallery } from "../../components/ListingGallery";
import { ListingMarker } from "../../components/search/ListingMarker";
import { PhotoViewer } from "../../components/PhotoViewer";

const STATUS_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  Active: { emoji: "\u{1F3E1}", label: "ACTIVE", color: "#2EA043" },
  "New Listing": { emoji: "\u{1F680}", label: "NEW LISTING", color: "#2EA043" },
  "Price Change": {
    emoji: "\u{1F4B0}",
    label: "PRICE CHANGE",
    color: "#2EA043",
  },
  "Back On Market": {
    emoji: "\u267B\uFE0F",
    label: "BACK ON MARKET",
    color: "#2EA043",
  },
  "Coming Soon": {
    emoji: "\u23F1\uFE0F",
    label: "COMING SOON",
    color: "#2EA043",
  },
  Contingent: { emoji: "\u{1F91E}", label: "CONTINGENT", color: "#FFA300" },
  Pending: { emoji: "\u231B", label: "PENDING", color: "#FFA300" },
  Closed: { emoji: "\u{1F511}", label: "CLOSED", color: "#0A84FF" },
  Expired: { emoji: "\u2620\uFE0F", label: "EXPIRED", color: "#E5484D" },
  Canceled: { emoji: "\u{1F6AB}", label: "CANCELED", color: "#E5484D" },
  Hold: { emoji: "\u270B", label: "HOLD", color: "#E5484D" },
  Withdrawn: { emoji: "\u{1FA9D}", label: "WITHDRAWN", color: "#E5484D" },
};

const DEFAULT_STATUS = { emoji: "\u2753", label: "UNKNOWN", color: "#888888" };

function getStatus(listing: { MajorChangeType?: string; StandardStatus?: string }) {
  const key = listing.MajorChangeType ?? listing.StandardStatus;
  if (!key) return DEFAULT_STATUS;
  return STATUS_CONFIG[key] ?? DEFAULT_STATUS;
}

function formatPrice(price: number | undefined) {
  if (!price) return "$--";
  return "$" + price.toLocaleString("en-US");
}

function formatPpsqft(price: number | undefined, sqft: number | undefined) {
  if (!price || !sqft || sqft === 0) return "";
  return "$" + Math.round(price / sqft).toLocaleString("en-US") + "/sqft";
}

export default function ListingScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const { profile } = useAuth();

  const scheme = useColorScheme();
  const { data: listing, isLoading } = useListing(uid ?? "", profile?.UID ?? "");

  const [photoViewer, setPhotoViewer] = useState<{
    photoUrls: string[];
    startIndex: number;
  } | null>(null);

  const handleAgentPress = useCallback(
    (agentUid: string) => {
      router.push(`/agent/${agentUid}`);
    },
    [router],
  );

  if (isLoading || !listing) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.background }}
        edges={["top"]}
      >
        <NavBar onBack={() => router.back()} foreground={t.foreground} />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={t.foregroundMuted} />
        </View>
      </SafeAreaView>
    );
  }

  const status = getStatus(listing);
  const photoUrls = listing.Photos ?? [];
  const galleryHeight = screenWidth * 0.65;
  const mapHeight = screenWidth * 0.45;
  const cityState = [listing.City, listing.StateOrProvince]
    .filter(Boolean)
    .join(", ");

  const coord = useMemo(() => {
    const lat = parseFloat(listing.Latitude ?? "");
    const lng = parseFloat(listing.Longitude ?? "");
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  }, [listing.Latitude, listing.Longitude]);

  const listingSide = getAgents(
    listing.ListAgentFullName,
    listing.ListAgentUID,
    listing.CoListAgentFullName,
    listing.CoListAgentUID,
    listing.ListAgentOfficeName,
  );

  const buyerSide = getAgents(
    listing.BuyerAgentFullName,
    listing.BuyerAgentUID,
    listing.CoBuyerAgentFullName,
    listing.CoBuyerAgentUID,
    listing.BuyerAgentOfficeName,
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
        edges={["top"]}
      >
        <NavBar onBack={() => router.back()} foreground="#FFFFFF" />
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} bounces>
        {/* Map snapshot */}
        {coord ? (
          <MapView
            style={{ height: mapHeight }}
            initialRegion={{
              ...coord,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            userInterfaceStyle={scheme === "dark" ? "dark" : "light"}
            showsPointsOfInterest={false}
          >
            <Marker coordinate={coord} anchor={{ x: 0.5, y: 1 }}>
              <ListingMarker listing={listing} />
            </Marker>
          </MapView>
        ) : (
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
                fontFamily: "GeistSans-Medium",
                fontSize: 13,
                color: t.foregroundMuted,
              }}
            >
              {cityState || "Unknown location"}
            </Text>
          </View>
        )}

        {/* Photos */}
        <ListingGallery
          listingIndex={0}
          photoUrls={photoUrls}
          height={galleryHeight}
          statusEmoji={status.emoji}
          statusText={status.label}
          statusColor={status.color}
          onOpenViewer={(startIndex) =>
            setPhotoViewer({ photoUrls, startIndex })
          }
        />

        {/* Price */}
        <View style={{ paddingHorizontal: 12, paddingTop: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "GeistMono",
                fontWeight: "700",
                fontSize: 28,
                color: status.color,
              }}
            >
              {formatPrice(listing.CurrentPrice)}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "GeistSans-Medium",
                fontSize: 17,
                color: t.foregroundMuted,
              }}
            >
              {formatPpsqft(listing.CurrentPrice, listing.LivingArea)}
            </Text>
          </View>

          {/* Stats row */}
          <Text
            numberOfLines={1}
            style={{ color: t.foreground, fontSize: 17, marginTop: 10 }}
          >
            {listing.BedroomsTotal != null && (
              <>
                <Text style={{ fontFamily: "GeistSans-Bold" }}>
                  {listing.BedroomsTotal}
                </Text>
                <Text style={{ fontFamily: "GeistSans" }}> bd </Text>
              </>
            )}
            {listing.BathroomsTotalInteger != null && (
              <>
                <Text style={{ fontFamily: "GeistSans-Bold" }}>
                  {"\u00B7"} {listing.BathroomsTotalInteger}
                </Text>
                <Text style={{ fontFamily: "GeistSans" }}> ba </Text>
              </>
            )}
            {listing.LivingArea != null && (
              <>
                <Text style={{ fontFamily: "GeistSans-Bold" }}>
                  {"\u00B7"} {listing.LivingArea.toLocaleString()}
                </Text>
                <Text style={{ fontFamily: "GeistSans" }}> sqft </Text>
              </>
            )}
            {listing.LotSizeSquareFeet != null && (
              <>
                <Text style={{ fontFamily: "GeistSans-Bold" }}>
                  {"\u00B7"}{" "}
                  {listing.LotSizeSquareFeet.toLocaleString()}
                </Text>
                <Text style={{ fontFamily: "GeistSans" }}> lot sqft </Text>
              </>
            )}
            {listing.DaysOnMarket != null && (
              <>
                <Text style={{ fontFamily: "GeistSans-Bold" }}>
                  {"\u00B7"} {listing.DaysOnMarket}
                </Text>
                <Text style={{ fontFamily: "GeistSans" }}> DOM</Text>
              </>
            )}
          </Text>

          {/* Address */}
          <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 10 }}>
            <Text
              style={{ fontFamily: "GeistSans-Bold", color: t.foreground }}
            >
              {listing.UnparsedAddress ?? "No address"}
            </Text>
            {listing.PropertySubType && (
              <Text
                style={{
                  fontFamily: "GeistSans-Medium",
                  color: t.foregroundMuted,
                }}
              >
                {"  "}
                {listing.PropertySubType}
              </Text>
            )}
          </Text>

          {/* Areas */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
            {cityState ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 17,
                  color: t.foreground,
                  textDecorationLine: "underline",
                }}
              >
                {cityState}
              </Text>
            ) : null}
            {listing.PostalCode ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 17,
                  color: t.foreground,
                  textDecorationLine: "underline",
                }}
              >
                {listing.PostalCode}
              </Text>
            ) : null}
          </View>

          {/* Remarks */}
          {listing.PublicRemarks && (
            <Text
              numberOfLines={4}
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foreground,
                marginTop: 16,
                lineHeight: 22,
              }}
            >
              {listing.PublicRemarks}
            </Text>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: t.border,
              marginTop: 16,
            }}
          />

          {/* Agents */}
          {listingSide.agents.length > 0 && (
            <AgentSection
              label="Listed by"
              officeName={listingSide.officeName}
              agents={listingSide.agents}
              foreground={t.foreground}
              foregroundMuted={t.foregroundMuted}
              onAgentPress={handleAgentPress}
            />
          )}
          {buyerSide.agents.length > 0 && (
            <AgentSection
              label="Sold by"
              officeName={buyerSide.officeName}
              agents={buyerSide.agents}
              foreground={t.foreground}
              foregroundMuted={t.foregroundMuted}
              onAgentPress={handleAgentPress}
            />
          )}

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 20,
              marginBottom: 40,
            }}
          >
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: t.foreground,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <ShareNetwork size={18} color={t.background} weight="fill" />
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 15,
                  color: t.background,
                }}
              >
                Share
              </Text>
            </Pressable>

            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: t.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart size={20} color={t.foreground} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Photo viewer overlay */}
      {photoViewer && (
        <PhotoViewer
          photoUrls={photoViewer.photoUrls}
          startIndex={photoViewer.startIndex}
          onClose={() => setPhotoViewer(null)}
        />
      )}
    </View>
  );
}

function NavBar({
  onBack,
  foreground,
}: {
  onBack: () => void;
  foreground: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <Pressable
        hitSlop={8}
        onPress={onBack}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.4)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CaretLeft size={22} color={foreground} weight="bold" />
      </Pressable>
    </View>
  );
}

interface AgentInfo {
  name: string;
  uid?: string;
}

function getAgents(
  primaryName?: string,
  primaryUid?: string,
  secondaryName?: string,
  secondaryUid?: string,
  officeName?: string,
) {
  const agents: AgentInfo[] = [];
  if (primaryName) agents.push({ name: primaryName, uid: primaryUid });
  if (secondaryName) agents.push({ name: secondaryName, uid: secondaryUid });
  return { agents, officeName: officeName ?? "" };
}

function AgentSection({
  label,
  officeName,
  agents,
  foreground,
  foregroundMuted,
  onAgentPress,
}: {
  label: string;
  officeName: string;
  agents: AgentInfo[];
  foreground: string;
  foregroundMuted: string;
  onAgentPress: (uid: string) => void;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text
        numberOfLines={1}
        style={{ fontFamily: "GeistSans", fontSize: 15, color: foregroundMuted }}
      >
        {label} {officeName}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 2 }}>
        {agents.map((agent, i) => (
          <React.Fragment key={agent.uid ?? agent.name}>
            {i > 0 && (
              <Text
                style={{
                  fontFamily: "GeistSans-Light",
                  color: foreground,
                }}
              >
                {" & "}
              </Text>
            )}
            <Text
              onPress={
                agent.uid ? () => onAgentPress(agent.uid!) : undefined
              }
              style={{
                fontFamily: "GeistSans-SemiBold",
                color: foreground,
                textDecorationLine: agent.uid ? "underline" : "none",
              }}
            >
              {agent.name}
            </Text>
          </React.Fragment>
        ))}
      </Text>
    </View>
  );
}
