import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import RNShare, { Social } from "react-native-share";
import { FACEBOOK_APP_ID } from "../../lib/api/constants";
import ViewShot from "react-native-view-shot";

// Check if ViewShot native module is available (crashes in Expo Go)
let isViewShotAvailable = true;
try {
  // captureRef will throw at import time if the native module is missing
  if (!ViewShot) isViewShotAvailable = false;
} catch {
  isViewShotAvailable = false;
}
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  X,
  CaretLeft,
  InstagramLogo,
  FloppyDisk,
  Link,
  ShareNetwork,
  Check,
  PlusCircle,
  Trash,
} from "phosphor-react-native";
import type { Listing } from "../../types/listing";
import {
  DraggableSticker,
  StickerPicker,
  StickerVisual,
  type StickerData,
  type StickerType,
} from "./StorySticker";

// ─── Types ───────────────────────────────────────────────────────────

interface InstagramStoryFlowProps {
  visible: boolean;
  onClose: () => void;
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

// ─── Photo Selection (Step 1) ────────────────────────────────────────

interface PhotoSelectionProps {
  photos: string[];
  selected: number[];
  onToggle: (index: number) => void;
  onNext: () => void;
  onClose: () => void;
}

function PhotoSelection({
  photos,
  selected,
  onToggle,
  onNext,
  onClose,
}: PhotoSelectionProps) {
  const { width } = useWindowDimensions();
  const itemSize = (width - 2) / 2; // 2-column grid, 2px spacing

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingTop: 10,
          paddingBottom: 20,
        }}
      >
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={20} color="#FFFFFF" weight="bold" />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 18,
              color: "#FFFFFF",
            }}
          >
            Select up to 3 photos
          </Text>
        </View>
        {/* Invisible spacer for centering */}
        <View style={{ width: 44, height: 44 }} />
      </View>

      {/* Photo Grid */}
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {photos.map((url, index) => {
            const selectionIndex = selected.indexOf(index);
            const isSelected = selectionIndex !== -1;

            return (
              <Pressable
                key={`${url}-${index}`}
                onPress={() => onToggle(index)}
                style={{
                  width: itemSize,
                  height: itemSize,
                  transform: [{ scale: isSelected ? 0.98 : 1 }],
                }}
              >
                <Image
                  source={{ uri: url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
                  transition={200}
                />
                {/* Selected overlay */}
                {isSelected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 128, 255, 0.4)",
                    }}
                  >
                    {/* Order number badge */}
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "rgba(0, 128, 255, 1.0)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "GeistSans-SemiBold",
                          fontSize: 16,
                          color: "#FFFFFF",
                        }}
                      >
                        {selectionIndex + 1}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Pressable
          onPress={onNext}
          disabled={selected.length === 0}
          style={{
            height: 56,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            opacity: selected.length === 0 ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 18,
              color: "#000000",
            }}
          >
            Use {selected.length} photo{selected.length !== 1 ? "s" : ""}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Story Editor (Step 2) ───────────────────────────────────────────

interface StoryEditorProps {
  selectedPhotos: string[];
  listing: InstagramStoryFlowProps["listing"];
  shareLink: string;
  onBack: () => void;
  onClose: () => void;
}

let stickerIdCounter = 0;

function StoryEditor({
  selectedPhotos,
  listing,
  shareLink,
  onBack,
  onClose,
}: StoryEditorProps) {
  const { width: screenWidth } = useWindowDimensions();
  const storyWidth = screenWidth - 24; // 12px margin each side
  const storyHeight = (storyWidth * 16) / 9;

  const viewShotRef = useRef<ViewShot>(null);
  const stickerPickerRef = useRef<BottomSheet>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ─── Stickers ──────────────────────────────────────────────────────
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteZoneActive, setDeleteZoneActive] = useState(false);

  const handleAddSticker = useCallback((type: StickerType) => {
    const id = `sticker-${++stickerIdCounter}`;
    setStickers((prev) => [
      ...prev,
      { id, type, x: 0, y: 0, scale: 1, rotation: 0 },
    ]);
    stickerPickerRef.current?.close();
  }, []);

  const handleUpdateSticker = useCallback(
    (id: string, updates: Partial<StickerData>) => {
      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const handleDragStart = useCallback(() => {
    setShowDeleteZone(true);
  }, []);

  const handleDragEnd = useCallback(
    (id: string, y: number) => {
      // Check if sticker is in delete zone (bottom 120px of story)
      const deleteThreshold = storyHeight - 120;
      if (y > deleteThreshold) {
        // Delete sticker
        setStickers((prev) => prev.filter((s) => s.id !== id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowDeleteZone(false);
      setDeleteZoneActive(false);
    },
    [storyHeight],
  );

  const handleDeselectAll = useCallback(() => {
    // Tap on story background deselects all
  }, []);

  // ─── Capture & Share ───────────────────────────────────────────────
  const captureStory = useCallback(async (): Promise<string> => {
    if (!viewShotRef.current?.capture) {
      throw new Error("ViewShot not ready");
    }
    return viewShotRef.current.capture();
  }, []);

  // Share to Instagram via Instagram Stories Kit
  const handleShareToInstagram = useCallback(async () => {
    setIsGenerating(true);
    try {
      const uri = await captureStory();

      if (Platform.OS === "ios") {
        const canOpen = await Linking.canOpenURL("instagram-stories://share");
        if (!canOpen) {
          Alert.alert(
            "Instagram Not Found",
            "Please install Instagram to share stories",
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
    } catch (error) {
      // react-native-share throws on user cancellation — don't show error for that
      const msg = (error as Error)?.message ?? "";
      if (!msg.includes("User did not share") && !msg.includes("cancel")) {
        Alert.alert("Error", "Failed to share to Instagram");
      }
    } finally {
      // Minimum 2-second loading animation
      setTimeout(() => setIsGenerating(false), 2000);
    }
  }, [captureStory]);

  // Save to gallery
  const handleSave = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to save photos");
        return;
      }
      const uri = await captureStory();
      await MediaLibrary.saveToLibraryAsync(uri);
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      Alert.alert("Error", "Failed to save image");
    }
  }, [captureStory]);

  // Copy link
  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(shareLink);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [shareLink]);

  // Native share
  const handleNativeShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const uri = await captureStory();
      await Sharing.shareAsync(uri, { mimeType: "image/png" });
    } catch {
      Alert.alert("Error", "Failed to share");
    } finally {
      setIsGenerating(false);
    }
  }, [captureStory]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Header — overlaid on top with gradient */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingTop: 10,
            paddingBottom: 30,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CaretLeft size={20} color="#FFFFFF" weight="bold" />
          </Pressable>

          {/* Title */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 18,
                color: "#FFFFFF",
              }}
            >
              Edit Story
            </Text>
          </View>

          {/* Add sticker button */}
          <Pressable
            onPress={() => stickerPickerRef.current?.snapToIndex(0)}
            hitSlop={8}
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusCircle size={24} color="#FFFFFF" weight="fill" />
          </Pressable>
        </LinearGradient>
      </View>

      {/* Story Preview */}
      <Pressable
        onPress={handleDeselectAll}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 60,
        }}
      >
        <View
          style={{
            width: storyWidth,
            height: storyHeight,
            borderRadius: 12,
            overflow: "hidden",
            // Shadow
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1, width: 1080, height: 1920 }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* Photos stacked vertically */}
            {selectedPhotos.map((url, index) => (
              <View key={`photo-${index}`} style={{ flex: 1, width: "100%" }}>
                <Image
                  source={{ uri: url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            ))}

            {/* Stickers rendered on top of photos */}
            {stickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                listing={listing}
                onUpdate={handleUpdateSticker}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                containerHeight={storyHeight}
              />
            ))}

            {/* Tuesday branding overlay — bottom-right */}
            <View
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: 5,
                paddingHorizontal: 6,
                paddingVertical: 4,
              }}
            >
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
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "GeistSans-Bold",
                    color: "#000",
                  }}
                >
                  T
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                @ontuesdayapp
              </Text>
            </View>
          </ViewShot>

          {/* Delete zone — appears during drag at bottom of story */}
          {showDeleteZone && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
                backgroundColor: deleteZoneActive
                  ? "rgba(229, 72, 77, 0.5)"
                  : "rgba(229, 72, 77, 0.1)",
                borderTopWidth: 2,
                borderTopColor: deleteZoneActive
                  ? "rgba(229, 72, 77, 0.7)"
                  : "rgba(229, 72, 77, 0.3)",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Trash
                size={32}
                color={deleteZoneActive ? "#FFFFFF" : "#E5484D"}
                weight={deleteZoneActive ? "fill" : "regular"}
              />
              {deleteZoneActive && (
                <Text
                  style={{
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                >
                  Release to delete
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>

      {/* Footer Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 12,
          paddingBottom: 40,
          paddingTop: 16,
        }}
      >
        {/* Instagram Story button */}
        <Pressable
          onPress={handleShareToInstagram}
          disabled={isGenerating}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            backgroundColor: isGenerating
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.2)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transform: [{ scale: isGenerating ? 1.05 : 1 }],
          }}
        >
          <InstagramLogo
            size={18}
            color="#FFFFFF"
            weight="fill"
          />
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 13,
              color: "#FFFFFF",
            }}
          >
            {isGenerating ? "Creating..." : "STORY"}
          </Text>
        </Pressable>

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={isGenerating}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            backgroundColor: isSaved
              ? "rgba(255,255,255,0.3)"
              : "rgba(255,255,255,0.2)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {isSaved ? (
            <Check size={16} color="#FFFFFF" weight="bold" />
          ) : (
            <FloppyDisk size={16} color="#FFFFFF" weight="bold" />
          )}
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 13,
              color: "#FFFFFF",
            }}
          >
            {isSaved ? "Saved!" : "Save"}
          </Text>
        </Pressable>

        {/* Copy Link button */}
        <Pressable
          onPress={handleCopyLink}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isCopied ? "#000000" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isCopied ? (
            <Check size={18} color="#FFFFFF" weight="bold" />
          ) : (
            <Link size={18} color="#000000" weight="bold" />
          )}
        </Pressable>

        {/* Share button */}
        <Pressable
          onPress={handleNativeShare}
          disabled={isGenerating}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <ShareNetwork size={18} color="#000000" weight="bold" />
          )}
        </Pressable>
      </View>

      {/* Sticker Picker Bottom Sheet */}
      <BottomSheet
        ref={stickerPickerRef}
        index={-1}
        snapPoints={[350]}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#1C1C1E", borderRadius: 20 }}
        handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.3)" }}
      >
        <BottomSheetView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 17,
                color: "#FFFFFF",
              }}
            >
              Add Sticker
            </Text>
            <Pressable onPress={() => stickerPickerRef.current?.close()}>
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 17,
                  color: "#0A84FF",
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>
          <StickerPicker listing={listing} onSelect={handleAddSticker} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

// ─── Main Flow ───────────────────────────────────────────────────────

export function InstagramStoryFlow({
  visible,
  onClose,
  listing,
  shareLink,
}: InstagramStoryFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Guard: ViewShot native module required (not available in Expo Go)
  if (!isViewShotAvailable && visible) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 20, color: "#FFFFFF", textAlign: "center", marginBottom: 12 }}>
            Not Available in Expo Go
          </Text>
          <Text style={{ fontFamily: "GeistSans", fontSize: 16, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24 }}>
            Instagram Story features require a development build. Run with expo-dev-client to use this feature.
          </Text>
          <Pressable onPress={onClose} style={{ height: 48, paddingHorizontal: 32, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: "GeistSans-SemiBold", fontSize: 16, color: "#000000" }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const photos = useMemo(
    () => listing.Photos ?? (listing.PreferredPhoto ? [listing.PreferredPhoto] : []),
    [listing.Photos, listing.PreferredPhoto],
  );

  const selectedPhotos = useMemo(
    () => selectedIndices.map((i) => photos[i]),
    [selectedIndices, photos],
  );

  const handleTogglePhoto = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, index];
    });
  }, []);

  const handleClose = useCallback(() => {
    setStep(1);
    setSelectedIndices([]);
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {step === 1 ? (
          <PhotoSelection
            photos={photos}
            selected={selectedIndices}
            onToggle={handleTogglePhoto}
            onNext={() => setStep(2)}
            onClose={handleClose}
          />
        ) : (
          <StoryEditor
            selectedPhotos={selectedPhotos}
            listing={listing}
            shareLink={shareLink}
            onBack={handleBack}
            onClose={handleClose}
          />
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
