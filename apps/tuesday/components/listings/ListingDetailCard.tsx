import React from "react";
import { View, Text } from "react-native";
import { ListingGallery } from "../ListingGallery";
import type { Listing } from "../../types/listing";

// --- Status display config ---

const GREEN = "#2EA043";
const AMBER = "#F5A623";
const RED = "#E5484D";
const ACCENT = "#0A84FF";

const STATUS_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  "Active":         { emoji: "\u{1F3E1}", label: "ACTIVE",         color: GREEN },
  "New Listing":    { emoji: "\u{1F680}", label: "NEW LISTING",    color: GREEN },
  "Price Change":   { emoji: "\u{1F4B0}", label: "PRICE CHANGE",   color: GREEN },
  "Back On Market": { emoji: "\u267B\uFE0F",  label: "BACK ON MARKET", color: GREEN },
  "Coming Soon":    { emoji: "\u23F1\uFE0F",  label: "COMING SOON",    color: GREEN },
  "Contingent":     { emoji: "\u{1F91E}", label: "CONTINGENT", color: AMBER },
  "Pending":        { emoji: "\u231B",    label: "PENDING",    color: AMBER },
  "Closed":         { emoji: "\u{1F511}", label: "CLOSED", color: ACCENT },
  "Expired":        { emoji: "\u2620\uFE0F",  label: "EXPIRED",    color: RED },
  "Canceled":       { emoji: "\u{1F6AB}", label: "CANCELED",   color: RED },
  "Hold":           { emoji: "\u270B",    label: "HOLD",       color: RED },
  "Withdrawn":      { emoji: "\u{1FA9D}", label: "WITHDRAWN",  color: RED },
  "Deleted":        { emoji: "\u{1F5D1}\uFE0F",  label: "DELETED",    color: RED },
  "Incomplete":     { emoji: "\u26A0\uFE0F",  label: "INCOMPLETE", color: RED },
};

const DEFAULT_STATUS = { emoji: "\u2753", label: "UNKNOWN", color: "#888888" };

function getStatusConfig(item: Listing) {
  const key = item.MajorChangeType ?? item.StandardStatus;
  if (!key) return DEFAULT_STATUS;
  return STATUS_CONFIG[key] ?? DEFAULT_STATUS;
}

// --- Agent helpers ---

interface AgentInfo {
  name: string;
  uid?: string;
}

interface AgentSide {
  offices: string[];
  agents: AgentInfo[];
}

function getListingSide(item: Listing): AgentSide {
  const offices = [item.ListAgentOfficeName, item.CoListAgentOfficeName].filter(
    (o): o is string => !!o,
  );
  const agents: AgentInfo[] = [];
  if (item.ListAgentFullName) agents.push({ name: item.ListAgentFullName, uid: item.ListAgentUID });
  if (item.CoListAgentFullName) agents.push({ name: item.CoListAgentFullName, uid: item.CoListAgentUID });
  return { offices, agents };
}

function getBuyerSide(item: Listing): AgentSide | null {
  const offices = [item.BuyerAgentOfficeName, item.CoBuyerAgentOfficeName].filter(
    (o): o is string => !!o,
  );
  const agents: AgentInfo[] = [];
  if (item.BuyerAgentFullName) agents.push({ name: item.BuyerAgentFullName, uid: item.BuyerAgentUID });
  if (item.CoBuyerAgentFullName) agents.push({ name: item.CoBuyerAgentFullName, uid: item.CoBuyerAgentUID });
  if (agents.length === 0) return null;
  return { offices, agents };
}

// --- Formatting ---

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

// --- Sub-components ---

function AgentName({
  agent,
  color,
  onPress,
}: {
  agent: AgentInfo;
  color: string;
  onPress?: (uid: string) => void;
}) {
  const handlePress = () => {
    if (agent.uid && onPress) onPress(agent.uid);
  };

  return (
    <Text
      onPress={agent.uid ? handlePress : undefined}
      style={{
        fontFamily: "GeistSans-SemiBold",
        color,
        textDecorationLine: agent.uid ? "underline" : "none",
      }}
    >
      {agent.name}
    </Text>
  );
}

function AgentSection({
  label,
  side,
  color,
  nameColor,
  onAgentPress,
}: {
  label: string;
  side: AgentSide;
  color: string;
  nameColor: string;
  onAgentPress?: (uid: string) => void;
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
            <AgentName agent={side.agents[0]} color={nameColor} onPress={onAgentPress} />
            <Text style={{ fontFamily: "GeistSans-Light", color: nameColor }}>
              {" & "}
            </Text>
            <AgentName agent={side.agents[1]} color={nameColor} onPress={onAgentPress} />
          </>
        ) : (
          <AgentName agent={side.agents[0]} color={nameColor} onPress={onAgentPress} />
        )}
      </Text>
    </View>
  );
}

// --- Main component ---

interface ListingDetailCardProps {
  listing: Listing;
  listingIndex: number;
  height: number;
  isNearViewport?: boolean;
  onOpenPhotoViewer?: (startIndex: number) => void;
  onAgentPress?: (uid: string) => void;
  foreground: string;
  foregroundMuted: string;
  background: string;
  backgroundSecondary: string;
  border: string;
}

export function ListingDetailCard({
  listing,
  listingIndex,
  height,
  isNearViewport = true,
  onOpenPhotoViewer,
  onAgentPress,
  foreground,
  foregroundMuted,
  background,
  backgroundSecondary,
  border,
}: ListingDetailCardProps) {
  const status = getStatusConfig(listing);
  const listingSide = getListingSide(listing);
  const buyerSide = getBuyerSide(listing);
  const photoUrls = listing.Photos ?? [];
  const cityState = [listing.City, listing.StateOrProvince]
    .filter(Boolean)
    .join(", ");

  const mapHeight = height * 0.3;
  const galleryHeight = height * 0.3;
  const infoHeight = height * 0.4;

  return (
    <View style={{ height, backgroundColor: background }}>
      {/* Map Snapshot — 30% */}
      <View
        style={{
          height: mapHeight,
          backgroundColor: backgroundSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: foregroundMuted,
            fontFamily: "GeistSans-Medium",
            fontSize: 13,
          }}
        >
          {cityState || "Unknown location"}
        </Text>
      </View>

      {/* Photo Gallery — 30% */}
      <ListingGallery
        listingIndex={listingIndex}
        photoUrls={photoUrls}
        height={galleryHeight}
        statusEmoji={status.emoji}
        statusText={status.label}
        statusColor={status.color}
        isNearViewport={isNearViewport}
        onOpenViewer={(startIndex) => onOpenPhotoViewer?.(startIndex)}
      />

      {/* Info — 40% */}
      <View
        style={{
          height: infoHeight,
          backgroundColor: background,
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
            {formatPrice(listing.CurrentPrice)}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 17,
              color: foregroundMuted,
            }}
          >
            {formatPpsqft(listing.CurrentPrice, listing.LivingArea)}
          </Text>
        </View>

        {/* Stats row */}
        <Text numberOfLines={1} style={{ color: foreground, fontSize: 17, marginTop: 10 }}>
          {listing.BedroomsTotal != null && (
            <>
              <Text style={{ fontFamily: "GeistSans-Bold" }}>{listing.BedroomsTotal}</Text>
              <Text style={{ fontFamily: "GeistSans" }}> bd </Text>
            </>
          )}
          {listing.BathroomsTotalInteger != null && (
            <>
              <Text style={{ fontFamily: "GeistSans-Bold" }}>{"\u00B7"} {listing.BathroomsTotalInteger}</Text>
              <Text style={{ fontFamily: "GeistSans" }}> ba </Text>
            </>
          )}
          {listing.LivingArea != null && (
            <>
              <Text style={{ fontFamily: "GeistSans-Bold" }}>{"\u00B7"} {listing.LivingArea.toLocaleString()}</Text>
              <Text style={{ fontFamily: "GeistSans" }}> sqft </Text>
            </>
          )}
          {listing.LotSizeSquareFeet != null && (
            <>
              <Text style={{ fontFamily: "GeistSans-Bold" }}>{"\u00B7"} {listing.LotSizeSquareFeet.toLocaleString()}</Text>
              <Text style={{ fontFamily: "GeistSans" }}> lot sqft </Text>
            </>
          )}
          {listing.DaysOnMarket != null && (
            <>
              <Text style={{ fontFamily: "GeistSans-Bold" }}>{"\u00B7"} {formatDom(listing.DaysOnMarket)}</Text>
              <Text style={{ fontFamily: "GeistSans" }}> DOM</Text>
            </>
          )}
        </Text>

        {/* Address row */}
        <Text numberOfLines={1} style={{ fontSize: 17, marginTop: 10 }}>
          <Text style={{ fontFamily: "GeistSans-Bold", color: foreground }}>
            {listing.UnparsedAddress ?? "No address"}
          </Text>
          {listing.PropertySubType && (
            <Text style={{ fontFamily: "GeistSans-Medium", color: foregroundMuted }}>
              {"  "}{listing.PropertySubType}
            </Text>
          )}
        </Text>

        {/* Areas row */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          {cityState ? (
            <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: foreground, textDecorationLine: "underline" }}>
              {cityState}
            </Text>
          ) : null}
          {listing.PostalCode ? (
            <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: foreground, textDecorationLine: "underline" }}>
              {listing.PostalCode}
            </Text>
          ) : null}
          {listing.CountyOrParish ? (
            <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 17, color: foreground, textDecorationLine: "underline" }}>
              {listing.CountyOrParish}
            </Text>
          ) : null}
        </View>

        {/* Remarks */}
        {listing.PublicRemarks && (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans",
              fontSize: 17,
              color: foreground,
              marginTop: 10,
            }}
          >
            {listing.PublicRemarks}
          </Text>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: border, marginTop: 12 }} />

        {/* Agents */}
        <AgentSection label="Listed by" side={listingSide} color={foregroundMuted} nameColor={foreground} onAgentPress={onAgentPress} />
        {buyerSide && (
          <AgentSection label="Sold by" side={buyerSide} color={foregroundMuted} nameColor={foreground} onAgentPress={onAgentPress} />
        )}
      </View>
    </View>
  );
}
