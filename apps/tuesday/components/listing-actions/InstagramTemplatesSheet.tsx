import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { X, InstagramLogo } from "phosphor-react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import RNShare, { Social } from "react-native-share";
import { FACEBOOK_APP_ID } from "../../lib/api/constants";
import ViewShot from "react-native-view-shot";

// ─── Template Types ─────────────────────────────────────────────────

interface TemplateConfig {
  id: string;
  name: string;
  /** Layout function renders the template content inside ViewShot */
  layout: "luxury" | "gallery" | "market" | "bold" | "spotlight" | "grid";
}

const TEMPLATES: TemplateConfig[] = [
  { id: "luxury", name: "Luxury", layout: "luxury" },
  { id: "gallery", name: "Gallery", layout: "gallery" },
  { id: "market", name: "Market", layout: "market" },
  { id: "bold", name: "Bold", layout: "bold" },
  { id: "spotlight", name: "Spotlight", layout: "spotlight" },
  { id: "grid", name: "Grid", layout: "grid" },
];

// ─── Helpers ────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price.toLocaleString()}`;
}

// ─── Template Renders ───────────────────────────────────────────────

interface TemplateRenderProps {
  listing: InstagramTemplatesSheetProps["listing"];
  shareLink: string;
}

/** Luxury: Full-bleed hero photo, dark gradient bottom, large price + address */
function LuxuryTemplate({ listing }: TemplateRenderProps) {
  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {photo && (
        <Image
          source={{ uri: photo }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          contentFit="cover"
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          justifyContent: "flex-end",
          padding: 32,
        }}
      >
        {listing.CurrentPrice != null && (
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 42, color: "#FFFFFF" }}>
            {formatPrice(listing.CurrentPrice)}
          </Text>
        )}
        {listing.UnparsedAddress && (
          <Text
            numberOfLines={2}
            style={{ fontFamily: "GeistSans-Medium", fontSize: 20, color: "rgba(255,255,255,0.9)", marginTop: 8 }}
          >
            {listing.UnparsedAddress}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
          {listing.BedroomsTotal != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
              {listing.BedroomsTotal} Beds
            </Text>
          )}
          {listing.BathroomsTotalInteger != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
              {listing.BathroomsTotalInteger} Baths
            </Text>
          )}
          {listing.LivingArea != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
              {listing.LivingArea.toLocaleString()} sqft
            </Text>
          )}
        </View>
        {/* Tuesday branding */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 20 }}>
          <View
            style={{
              width: 13,
              height: 13,
              borderRadius: 3,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#000" }}>T</Text>
          </View>
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            @ontuesdayapp
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/** Gallery: 2 photos side by side top, stats bar at bottom */
function GalleryTemplate({ listing }: TemplateRenderProps) {
  const photos = listing.Photos ?? (listing.PreferredPhoto ? [listing.PreferredPhoto] : []);
  return (
    <View style={{ flex: 1, backgroundColor: "#1A1A2E" }}>
      {/* Two photos top */}
      <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
        {photos.slice(0, 2).map((url, i) => (
          <View key={i} style={{ flex: 1 }}>
            <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          </View>
        ))}
        {photos.length < 2 && (
          <View style={{ flex: 1, backgroundColor: "#2A2A4E" }} />
        )}
      </View>
      {/* Stats bar */}
      <View style={{ padding: 24, gap: 12 }}>
        {listing.CurrentPrice != null && (
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 36, color: "#FFFFFF" }}>
            {formatPrice(listing.CurrentPrice)}
          </Text>
        )}
        {listing.UnparsedAddress && (
          <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 18, color: "rgba(255,255,255,0.8)" }}>
            {listing.UnparsedAddress}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 20, marginTop: 4 }}>
          {listing.BedroomsTotal != null && (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 24, color: "#FFFFFF" }}>{listing.BedroomsTotal}</Text>
              <Text style={{ fontFamily: "GeistSans", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Beds</Text>
            </View>
          )}
          {listing.BathroomsTotalInteger != null && (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 24, color: "#FFFFFF" }}>{listing.BathroomsTotalInteger}</Text>
              <Text style={{ fontFamily: "GeistSans", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Baths</Text>
            </View>
          )}
          {listing.LivingArea != null && (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 24, color: "#FFFFFF" }}>{listing.LivingArea.toLocaleString()}</Text>
              <Text style={{ fontFamily: "GeistSans", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Sqft</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
          <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#000" }}>T</Text>
          </View>
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>@ontuesdayapp</Text>
        </View>
      </View>
    </View>
  );
}

/** Market: Clean white card, price badge, photo center */
function MarketTemplate({ listing }: TemplateRenderProps) {
  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5", justifyContent: "center", padding: 24 }}>
      {/* Price badge */}
      {listing.CurrentPrice != null && (
        <View style={{ backgroundColor: "#2EA043", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, alignSelf: "flex-start", marginBottom: 16 }}>
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 28, color: "#FFFFFF" }}>{formatPrice(listing.CurrentPrice)}</Text>
        </View>
      )}
      {/* Photo */}
      {photo && (
        <View style={{ borderRadius: 16, overflow: "hidden", height: "50%" }}>
          <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>
      )}
      {/* Info */}
      <View style={{ marginTop: 20 }}>
        {listing.UnparsedAddress && (
          <Text numberOfLines={2} style={{ fontFamily: "GeistSans-SemiBold", fontSize: 22, color: "#1A1A1A" }}>
            {listing.UnparsedAddress}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          {listing.BedroomsTotal != null && (
            <Text style={{ fontFamily: "GeistSans-Medium", fontSize: 16, color: "#666" }}>{listing.BedroomsTotal} bd</Text>
          )}
          {listing.BathroomsTotalInteger != null && (
            <Text style={{ fontFamily: "GeistSans-Medium", fontSize: 16, color: "#666" }}>{listing.BathroomsTotalInteger} ba</Text>
          )}
          {listing.LivingArea != null && (
            <Text style={{ fontFamily: "GeistSans-Medium", fontSize: 16, color: "#666" }}>{listing.LivingArea.toLocaleString()} sqft</Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 24 }}>
        <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#FFF" }}>T</Text>
        </View>
        <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "#999" }}>@ontuesdayapp</Text>
      </View>
    </View>
  );
}

/** Bold: Solid color background, huge price, minimal */
function BoldTemplate({ listing }: TemplateRenderProps) {
  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];
  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
      {/* Top half: photo */}
      {photo && (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>
      )}
      {/* Bottom half: bold stats */}
      <View style={{ flex: 1, justifyContent: "center", padding: 32, gap: 16 }}>
        {listing.CurrentPrice != null && (
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 52, color: "#FFFFFF", letterSpacing: -2 }}>
            {formatPrice(listing.CurrentPrice)}
          </Text>
        )}
        {listing.UnparsedAddress && (
          <Text numberOfLines={2} style={{ fontFamily: "GeistSans", fontSize: 18, color: "rgba(255,255,255,0.6)" }}>
            {listing.UnparsedAddress}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 24, marginTop: 8 }}>
          {listing.BedroomsTotal != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 20, color: "#FFFFFF" }}>{listing.BedroomsTotal} BD</Text>
          )}
          {listing.BathroomsTotalInteger != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 20, color: "#FFFFFF" }}>{listing.BathroomsTotalInteger} BA</Text>
          )}
          {listing.LivingArea != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 20, color: "#FFFFFF" }}>{listing.LivingArea.toLocaleString()} SF</Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 16 }}>
          <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#000" }}>T</Text>
          </View>
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>@ontuesdayapp</Text>
        </View>
      </View>
    </View>
  );
}

/** Spotlight: Full photo with centered text overlay */
function SpotlightTemplate({ listing }: TemplateRenderProps) {
  const photo = listing.PreferredPhoto ?? listing.Photos?.[0];
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {photo && (
        <Image
          source={{ uri: photo }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          contentFit="cover"
        />
      )}
      {/* Dark overlay */}
      <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)" }} />
      {/* Centered content */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        {listing.CurrentPrice != null && (
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 48, color: "#FFFFFF", textAlign: "center" }}>
            {formatPrice(listing.CurrentPrice)}
          </Text>
        )}
        {listing.UnparsedAddress && (
          <Text numberOfLines={2} style={{ fontFamily: "GeistSans-Medium", fontSize: 20, color: "#FFFFFF", textAlign: "center", marginTop: 12 }}>
            {listing.UnparsedAddress}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
          {listing.BedroomsTotal != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.8)" }}>{listing.BedroomsTotal} Beds</Text>
          )}
          {listing.BathroomsTotalInteger != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.8)" }}>{listing.BathroomsTotalInteger} Baths</Text>
          )}
          {listing.LivingArea != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "rgba(255,255,255,0.8)" }}>{listing.LivingArea.toLocaleString()} sqft</Text>
          )}
        </View>
      </View>
      {/* Branding bottom */}
      <View style={{ position: "absolute", bottom: 32, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 4 }}>
        <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#000" }}>T</Text>
        </View>
        <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>@ontuesdayapp</Text>
      </View>
    </View>
  );
}

/** Grid: 2x2 photo grid with info strip */
function GridTemplate({ listing }: TemplateRenderProps) {
  const photos = listing.Photos ?? (listing.PreferredPhoto ? [listing.PreferredPhoto] : []);
  const gridPhotos = photos.slice(0, 4);
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      {/* 2x2 grid */}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
          {gridPhotos.slice(0, 2).map((url, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          ))}
          {gridPhotos.length < 2 && <View style={{ flex: 1, backgroundColor: "#222" }} />}
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
          {gridPhotos.slice(2, 4).map((url, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          ))}
          {gridPhotos.length < 3 && <View style={{ flex: 1, backgroundColor: "#222" }} />}
          {gridPhotos.length < 4 && <View style={{ flex: 1, backgroundColor: "#222" }} />}
        </View>
      </View>
      {/* Info strip */}
      <View style={{ padding: 24, gap: 8 }}>
        {listing.CurrentPrice != null && (
          <Text style={{ fontFamily: "GeistSans-Bold", fontSize: 32, color: "#FFFFFF" }}>{formatPrice(listing.CurrentPrice)}</Text>
        )}
        {listing.UnparsedAddress && (
          <Text numberOfLines={1} style={{ fontFamily: "GeistSans-Medium", fontSize: 16, color: "rgba(255,255,255,0.8)" }}>{listing.UnparsedAddress}</Text>
        )}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 4 }}>
          {listing.BedroomsTotal != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{listing.BedroomsTotal} Beds</Text>
          )}
          {listing.BathroomsTotalInteger != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{listing.BathroomsTotalInteger} Baths</Text>
          )}
          {listing.LivingArea != null && (
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{listing.LivingArea.toLocaleString()} sqft</Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
          <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 8, fontFamily: "GeistSans-Bold", color: "#000" }}>T</Text>
          </View>
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>@ontuesdayapp</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Template Renderer Map ──────────────────────────────────────────

const TEMPLATE_RENDERERS: Record<
  TemplateConfig["layout"],
  React.FC<TemplateRenderProps>
> = {
  luxury: LuxuryTemplate,
  gallery: GalleryTemplate,
  market: MarketTemplate,
  bold: BoldTemplate,
  spotlight: SpotlightTemplate,
  grid: GridTemplate,
};

// ─── Template Preview Thumbnail ─────────────────────────────────────

interface TemplatePreviewProps {
  template: TemplateConfig;
  listing: InstagramTemplatesSheetProps["listing"];
  shareLink: string;
  isSelected: boolean;
  width: number;
  onSelect: () => void;
}

function TemplatePreview({
  template,
  listing,
  shareLink,
  isSelected,
  width,
  onSelect,
}: TemplatePreviewProps) {
  const Renderer = TEMPLATE_RENDERERS[template.layout];
  const previewHeight = (width * 16) / 9;

  return (
    <Pressable onPress={onSelect} style={{ width, gap: 12 }}>
      {/* Preview */}
      <View
        style={{
          width,
          height: Math.min(previewHeight, 320),
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: isSelected ? 3 : 0,
          borderColor: isSelected ? "#86EFAC" : "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
          shadowOpacity: isSelected ? 0.3 : 0.15,
          shadowRadius: isSelected ? 8 : 4,
          elevation: isSelected ? 8 : 4,
          transform: [{ scale: isSelected ? 1.02 : 1 }],
        }}
      >
        <Renderer listing={listing} shareLink={shareLink} />
      </View>
      {/* Name */}
      <Text
        style={{
          fontFamily: "GeistSans-Medium",
          fontSize: 16,
          color: isSelected ? "#86EFAC" : "rgba(255,255,255,0.7)",
          textAlign: "center",
        }}
      >
        {template.name}
      </Text>
    </Pressable>
  );
}

// ─── Main Sheet ─────────────────────────────────────────────────────

interface InstagramTemplatesSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  listing: {
    Photos?: string[];
    PreferredPhoto?: string;
    UnparsedAddress?: string;
    City?: string;
    CurrentPrice?: number;
    BedroomsTotal?: number;
    BathroomsTotalInteger?: number;
    LivingArea?: number;
    StandardStatus?: string;
  };
  shareLink: string;
}

export function InstagramTemplatesSheet({
  bottomSheetRef,
  listing,
  shareLink,
}: InstagramTemplatesSheetProps) {
  const { width: screenWidth } = useWindowDimensions();
  const snapPoints = useMemo(() => ["90%"], []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  const columnWidth = (screenWidth - 20 * 3) / 2; // 20px padding + 20px gap + 20px padding

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === selectedId),
    [selectedId],
  );

  // ─── Share to Instagram ───────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!selectedTemplate || isGenerating) return;

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!viewShotRef.current?.capture) {
        throw new Error("ViewShot not ready");
      }
      const uri = await viewShotRef.current.capture();

      // Minimum 2-second animation
      const startTime = Date.now();

      if (Platform.OS === "ios") {
        const canOpen = await Linking.canOpenURL("instagram-stories://share");
        if (!canOpen) {
          Alert.alert(
            "Instagram Not Found",
            "To share stories, you need to install the Instagram app",
            [{ text: "OK" }],
          );
          return;
        }
      }

      // Direct Instagram Stories sharing via Stories Kit
      await RNShare.shareSingle({
        backgroundImage: uri,
        social: Social.InstagramStories,
        appId: FACEBOOK_APP_ID,
      });

      // Ensure minimum 2s animation
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise((r) => setTimeout(r, 2000 - elapsed));
      }

      bottomSheetRef.current?.dismiss();
    } catch (error) {
      // react-native-share throws on user cancellation — don't show error for that
      const msg = (error as Error)?.message ?? "";
      if (!msg.includes("User did not share") && !msg.includes("cancel")) {
        Alert.alert("Error", "Failed to share to Instagram");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, isGenerating, bottomSheetRef]);

  const SelectedRenderer = selectedTemplate
    ? TEMPLATE_RENDERERS[selectedTemplate.layout]
    : null;

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#1C1C1E", borderRadius: 20 }}
        handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
            {/* Close button */}
            <Pressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "flex-end",
              }}
            >
              <X size={18} color="rgba(255,255,255,0.8)" weight="bold" />
            </Pressable>

            {/* Title */}
            <Text
              style={{
                fontFamily: "GeistSans-Bold",
                fontSize: 32,
                color: "#FFFFFF",
                marginTop: 8,
              }}
            >
              Choose a template
            </Text>
            <Text
              style={{
                fontFamily: "GeistSans",
                fontSize: 16,
                color: "rgba(255,255,255,0.5)",
                marginTop: 8,
              }}
            >
              Create a stunning story for Instagram
            </Text>
          </View>

          {/* Template Grid */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 20,
              paddingHorizontal: 20,
              paddingVertical: 30,
            }}
          >
            {TEMPLATES.map((template) => (
              <TemplatePreview
                key={template.id}
                template={template}
                listing={listing}
                shareLink={shareLink}
                isSelected={selectedId === template.id}
                width={columnWidth}
                onSelect={() => setSelectedId(template.id)}
              />
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 34,
              paddingTop: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Pressable
              onPress={handleShare}
              disabled={!selectedId || isGenerating}
              style={{
                height: 56,
                borderRadius: 16,
                overflow: "hidden",
                opacity: !selectedId || isGenerating ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={["rgb(214,41,118)", "rgb(250,100,50)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {isGenerating ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    style={{ transform: [{ scale: 0.8 }] }}
                  />
                ) : (
                  <>
                    <InstagramLogo size={24} color="#FFFFFF" weight="fill" />
                    <Text
                      style={{
                        fontFamily: "GeistSans-SemiBold",
                        fontSize: 17,
                        color: "#FFFFFF",
                      }}
                    >
                      Share to Instagram Stories
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Hidden ViewShot for generating the selected template at 1080x1920 */}
      {SelectedRenderer && (
        <View
          style={{
            position: "absolute",
            left: -9999,
            top: -9999,
            width: 1080,
            height: 1920,
          }}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1, width: 1080, height: 1920 }}
            style={{ width: 1080, height: 1920 }}
          >
            <SelectedRenderer listing={listing} shareLink={shareLink} />
          </ViewShot>
        </View>
      )}
    </>
  );
}
