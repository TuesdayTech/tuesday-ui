import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import {
  CurrencyDollar,
  Bed,
  Shower,
  GridFour,
  Ruler,
  MapPin,
  Buildings,
  House,
  ListBullets,
} from "phosphor-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
// ─── Listing subset for stickers ─────────────────────────────────────

export interface StickerListingData {
  CurrentPrice?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  UnparsedAddress?: string;
  City?: string;
  StandardStatus?: string;
}

// ─── Sticker Type ────────────────────────────────────────────────────

export type StickerType =
  | "price"
  | "beds"
  | "baths"
  | "pricePerSqft"
  | "sqft"
  | "address"
  | "city"
  | "bedsAndBaths"
  | "fullStats";

export interface StickerData {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface StickerPickerItem {
  type: StickerType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; weight?: string }>;
  visible: boolean;
}

// ─── Get available stickers for listing ──────────────────────────────

export function getAvailableStickers(
  listing: StickerListingData,
): StickerPickerItem[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: StickerPickerItem[] = [
    {
      type: "price",
      label: "Price",
      icon: CurrencyDollar as any,
      visible: listing.CurrentPrice != null,
    },
    {
      type: "beds",
      label: "Beds",
      icon: Bed as any,
      visible: listing.BedroomsTotal != null,
    },
    {
      type: "baths",
      label: "Baths",
      icon: Shower as any,
      visible: listing.BathroomsTotalInteger != null,
    },
    {
      type: "pricePerSqft",
      label: "$/sqft",
      icon: GridFour as any,
      visible: listing.CurrentPrice != null && listing.LivingArea != null,
    },
    {
      type: "sqft",
      label: "Sqft",
      icon: Ruler as any,
      visible: listing.LivingArea != null,
    },
    {
      type: "address",
      label: "Address",
      icon: MapPin as any,
      visible: listing.UnparsedAddress != null,
    },
    {
      type: "city",
      label: "City",
      icon: Buildings as any,
      visible: listing.City != null,
    },
    {
      type: "bedsAndBaths",
      label: "Beds & Baths",
      icon: House as any,
      visible: listing.BedroomsTotal != null || listing.BathroomsTotalInteger != null,
    },
    {
      type: "fullStats",
      label: "Full Stats",
      icon: ListBullets as any,
      visible:
        listing.BedroomsTotal != null ||
        listing.BathroomsTotalInteger != null ||
        listing.LivingArea != null,
    },
  ];

  return items.filter((i) => i.visible);
}

// ─── Sticker Visual Render ───────────────────────────────────────────

interface StickerVisualProps {
  type: StickerType;
  listing: StickerListingData;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "#2EA043",
  Pending: "#FFA300",
  Closed: "#0A84FF",
  Expired: "#E5484D",
};

function formatStickerPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price.toLocaleString()}`;
}

export function StickerVisual({ type, listing }: StickerVisualProps) {
  const statusColor = STATUS_COLORS[listing.StandardStatus ?? "Active"] ?? "#2EA043";

  switch (type) {
    case "price":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: statusColor,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 3,
            borderColor: "#FFFFFF",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>$</Text>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#FFFFFF" }}>
            {listing.CurrentPrice
              ? listing.CurrentPrice >= 1_000_000
                ? `${(listing.CurrentPrice / 1_000_000).toFixed(1)}M`
                : `${(listing.CurrentPrice / 1_000).toFixed(0)}K`
              : "--"}
          </Text>
        </View>
      );

    case "beds":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: "#9333EA",
          }}
        >
          <Bed size={20} color="#FFFFFF" weight="fill" />
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#FFFFFF" }}>
            {listing.BedroomsTotal ?? 0}
          </Text>
        </View>
      );

    case "baths":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: "#0A84FF",
          }}
        >
          <Shower size={20} color="#FFFFFF" weight="fill" />
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#FFFFFF" }}>
            {listing.BathroomsTotalInteger ?? 0}
          </Text>
        </View>
      );

    case "pricePerSqft": {
      const ppsqft =
        listing.CurrentPrice && listing.LivingArea
          ? Math.round(listing.CurrentPrice / listing.LivingArea)
          : 0;
      return (
        <View
          style={{
            alignItems: "center",
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: "#F97316",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF" }}>
            ${ppsqft.toLocaleString()}
          </Text>
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 12,
              color: "#FFFFFF",
            }}
          >
            per sqft
          </Text>
        </View>
      );
    }

    case "sqft":
      return (
        <View
          style={{
            alignItems: "center",
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: "#2EA043",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF" }}>
            {(listing.LivingArea ?? 0).toLocaleString()}
          </Text>
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 12,
              color: "#FFFFFF",
            }}
          >
            sqft
          </Text>
        </View>
      );

    case "address":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "rgba(0,0,0,0.8)",
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        >
          <MapPin size={14} color="#FFFFFF" weight="fill" />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
              maxWidth: 200,
            }}
          >
            {listing.UnparsedAddress ?? ""}
          </Text>
        </View>
      );

    case "city":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#4F46E5",
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        >
          <Buildings size={14} color="#FFFFFF" weight="fill" />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-Bold",
              fontSize: 18,
              color: "#FFFFFF",
              maxWidth: 160,
            }}
          >
            {listing.City ?? ""}
          </Text>
        </View>
      );

    case "bedsAndBaths":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#7C3AED",
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Bed size={16} color="#FFFFFF" weight="fill" />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
              {listing.BedroomsTotal ?? 0}
            </Text>
          </View>
          <View
            style={{
              width: 1,
              height: 20,
              backgroundColor: "rgba(255,255,255,0.5)",
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Shower size={16} color="#FFFFFF" weight="fill" />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
              {listing.BathroomsTotalInteger ?? 0}
            </Text>
          </View>
        </View>
      );

    case "fullStats":
      return (
        <View
          style={{
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "rgba(0,0,0,0.85)",
            borderWidth: 2,
            borderColor: "#FFFFFF",
            gap: 8,
          }}
        >
          {listing.BedroomsTotal != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 20, alignItems: "center" }}>
                <Bed size={14} color="#FFFFFF" weight="fill" />
              </View>
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                {listing.BedroomsTotal} Beds
              </Text>
            </View>
          )}
          {listing.BathroomsTotalInteger != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 20, alignItems: "center" }}>
                <Shower size={14} color="#FFFFFF" weight="fill" />
              </View>
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                {listing.BathroomsTotalInteger} Baths
              </Text>
            </View>
          )}
          {listing.LivingArea != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 20, alignItems: "center" }}>
                <Ruler size={14} color="#FFFFFF" weight="fill" />
              </View>
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                {listing.LivingArea.toLocaleString()} sqft
              </Text>
            </View>
          )}
        </View>
      );

    default:
      return null;
  }
}

// ─── Draggable Sticker ───────────────────────────────────────────────

interface DraggableStickerProps {
  sticker: StickerData;
  listing: StickerVisualProps["listing"];
  onUpdate: (id: string, updates: Partial<StickerData>) => void;
  onDragStart: () => void;
  onDragEnd: (id: string, y: number) => void;
  containerHeight: number;
}

export function DraggableSticker({
  sticker,
  listing,
  onUpdate,
  onDragStart,
  onDragEnd,
  containerHeight,
}: DraggableStickerProps) {
  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);
  const savedTranslateX = useSharedValue(sticker.x);
  const savedTranslateY = useSharedValue(sticker.y);
  const savedScale = useSharedValue(sticker.scale);
  const savedRotation = useSharedValue(sticker.rotation);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      isDragging.value = true;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(onUpdate)(sticker.id, {
        x: translateX.value,
        y: translateY.value,
      });
      runOnJS(onDragEnd)(sticker.id, translateY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(sticker.id, { scale: scale.value });
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      runOnJS(onUpdate)(sticker.id, { rotation: rotation.value });
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(scale.value, { damping: 8 }) },
      { rotate: `${rotation.value}rad` },
    ],
    shadowRadius: isDragging.value ? 10 : 5,
    shadowOpacity: isDragging.value ? 0.5 : 0.3,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          {
            position: "absolute",
            alignSelf: "center",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
          },
          animatedStyle,
        ]}
      >
        <StickerVisual type={sticker.type} listing={listing} />
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Sticker Picker Grid ─────────────────────────────────────────────

interface StickerPickerProps {
  listing: StickerVisualProps["listing"];
  onSelect: (type: StickerType) => void;
}

export function StickerPicker({ listing, onSelect }: StickerPickerProps) {
  const available = useMemo(() => getAvailableStickers(listing), [listing]);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        padding: 16,
      }}
    >
      {available.map((item) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={item.type}
            onPress={() => onSelect(item.type)}
            style={{
              width: 100,
              height: 100,
              borderRadius: 16,
              backgroundColor: "rgba(118,118,128,0.12)",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Icon size={28} color="#0A84FF" weight="regular" />
            <Text
              style={{
                fontFamily: "GeistSans-Medium",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
