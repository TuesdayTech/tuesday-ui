import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  Share,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import {
  CopySimple,
  PaperPlaneTilt,
  Sparkle,
  Stop,
} from "phosphor-react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAIShareText } from "../../hooks/use-listing-actions";
import type { ShareType } from "../../types/listing-actions";
import { SHARE_TYPE_COLORS } from "../../types/listing-actions";

// ─── Channel Names ───────────────────────────────────────────────────

const CHANNEL_NAMES: Record<ShareType, string> = {
  SMS: Platform.OS === "ios" ? "iMessage" : "SMS",
  Email: "Email",
  Facebook: "Facebook",
  XPost: "X",
  IGstory: "Instagram Stories",
  More: "Share",
};

// ─── Share Text Composer ─────────────────────────────────────────────

function composeShareText(
  aiText: string,
  shareLink: string,
  type: ShareType,
): string {
  if (type === "SMS") {
    return `${aiText}\n\nSee more: ${shareLink}`;
  }
  return `${shareLink}\n${aiText}`;
}

// ─── Smart Share Sheet ───────────────────────────────────────────────

interface SmartShareSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  shareType: ShareType | null;
  listingUid: string;
  profileUid: string;
  address?: string;
  photoUrl?: string;
  shareLink: string;
  playlistUID?: string | null;
  onOpenTemplates?: () => void;
}

export function SmartShareSheet({
  bottomSheetRef,
  shareType,
  listingUid,
  profileUid,
  address,
  photoUrl,
  shareLink,
  playlistUID,
  onOpenTemplates,
}: SmartShareSheetProps) {
  const t = useThemeColors();
  // const snapPoints = useMemo(() => ["70%", "95%"], []);

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
  const aiShare = useAIShareText();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Speech recognition events
  const transcriptRef = useRef("");
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    setTranscript(text);
    transcriptRef.current = text;
  });
  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    const finalTranscript = transcriptRef.current;
    if (finalTranscript) {
      setTimeout(() => {
        aiShare.generate({
          profileUID: profileUid,
          listingUID: listingUid,
          playlistUID: playlistUID ?? null,
          message: aiShare.text || null,
          transcript: finalTranscript,
          type: shareType ?? "SMS",
        });
      }, 700);
    }
  });
  useSpeechRecognitionEvent("error", () => {
    setIsRecording(false);
  });

  // Track keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => setKeyboardVisible(false), 150);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Generate AI text when sheet opens with a share type
  useEffect(() => {
    if (shareType && shareType !== "More" && shareType !== "IGstory") {
      aiShare.generate({
        profileUID: profileUid,
        listingUID: listingUid,
        playlistUID: playlistUID ?? null,
        type: shareType,
      });
    }
    return () => aiShare.cancel();
  }, [shareType, listingUid, profileUid, playlistUID]);

  const channelName = shareType ? CHANNEL_NAMES[shareType] : "";
  const brandColor = shareType ? SHARE_TYPE_COLORS[shareType] : "#888";

  // ─── Voice Recording ──────────────────────────────────────────────

  const handleRecordStart = useCallback(async () => {
    if (aiShare.isLoading || isRecording) return;
    const { granted } =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) return;
    setIsRecording(true);
    setTranscript("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
    });
  }, [aiShare.isLoading, isRecording]);

  const handleRecordStop = useCallback(() => {
    if (!isRecording) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    ExpoSpeechRecognitionModule.stop();
    // The "end" event handler above sets isRecording=false and triggers regeneration
  }, [isRecording]);

  // ─── Copy ──────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    const fullText = composeShareText(aiShare.text, shareLink, shareType ?? "SMS");
    await Clipboard.setStringAsync(fullText);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }, [aiShare.text, shareLink, shareType]);

  // ─── Send ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const fullText = composeShareText(aiShare.text, shareLink, shareType ?? "SMS");

    switch (shareType) {
      case "SMS": {
        const separator = Platform.OS === "ios" ? "&" : "?";
        const smsUrl = `sms:${separator}body=${encodeURIComponent(fullText)}`;
        await Linking.openURL(smsUrl);
        break;
      }
      case "Email": {
        const subject = `Property: ${address ?? ""}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullText)}`;
        await Linking.openURL(emailUrl);
        break;
      }
      case "Facebook": {
        // Try Facebook URL schemes in order, fallback to web
        const fbSchemes = [
          `fb://composer?text=${encodeURIComponent(aiShare.text)}&link=${encodeURIComponent(shareLink)}`,
          `fb://share?link=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(aiShare.text)}`,
          `fbapi://share?link=${encodeURIComponent(shareLink)}`,
        ];
        let opened = false;
        for (const scheme of fbSchemes) {
          try {
            const canOpen = await Linking.canOpenURL(scheme);
            if (canOpen) {
              await Linking.openURL(scheme);
              opened = true;
              break;
            }
          } catch {
            // Try next scheme
          }
        }
        if (!opened) {
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(aiShare.text)}`;
          await Linking.openURL(fbUrl);
        }
        break;
      }
      case "XPost": {
        // Try native Twitter app first, fallback to web
        const twitterScheme = `twitter://post?message=${encodeURIComponent(fullText)}`;
        try {
          const canOpen = await Linking.canOpenURL(twitterScheme);
          if (canOpen) {
            await Linking.openURL(twitterScheme);
          } else {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
            await Linking.openURL(twitterUrl);
          }
        } catch {
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
          await Linking.openURL(twitterUrl);
        }
        break;
      }
      case "IGstory": {
        // Open template-based Instagram flow
        bottomSheetRef.current?.dismiss();
        onOpenTemplates?.();
        return; // Don't close again below
      }
      default: {
        // "More" → native share sheet (UIActivityViewController on iOS)
        await Share.share({ message: fullText });
        break;
      }
    }

    bottomSheetRef.current?.dismiss();
  }, [aiShare.text, shareLink, shareType, address, bottomSheetRef, onOpenTemplates]);

  // ─── Dynamic send button text ─────────────────────────────────────

  const sendButtonText = useMemo(() => {
    switch (shareType) {
      case "SMS":
        return Platform.OS === "ios" ? "Share via iMessage" : "Share via SMS";
      case "Email":
        return "Share via Email";
      case "Facebook":
        return "Post to Facebook";
      case "XPost":
        return "Post to X";
      case "IGstory":
        return "Share to Instagram Stories";
      default:
        return "Share";
    }
  }, [shareType]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{
        backgroundColor: t.background,
        borderRadius: 20,
      }}
      handleIndicatorStyle={{ backgroundColor: t.foregroundMuted }}
      backdropComponent={renderBackdrop}
      onChange={(index) => {
        if (index === -1) aiShare.cancel();
      }}
    >
      <BottomSheetView>
        {/* Header */}
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 20,
            color: t.foreground,
            paddingTop: 20,
            paddingHorizontal: 16,
          }}
        >
          Smart Share via {channelName}
        </Text>

        {/* Listing preview card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginHorizontal: 16,
            marginTop: 16,
            height: 80,
            borderRadius: 8,
            backgroundColor: t.backgroundSecondary,
            overflow: "hidden",
          }}
        >
          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              style={{ width: 80, height: 80 }}
              contentFit="cover"
            />
          )}
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: "GeistSans-Medium",
                fontSize: 17,
                color: t.foreground,
              }}
            >
              {address ?? "Property"}
            </Text>
            {shareLink ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "GeistSans",
                  fontSize: 14,
                  color: t.foregroundMuted,
                  marginTop: 2,
                }}
              >
                {shareLink}
              </Text>
            ) : null}
          </View>
        </View>

        {/* AI text area */}
        <ScrollView
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={aiShare.text}
            onChangeText={aiShare.setText}
            multiline
            placeholder={aiShare.isLoading ? "" : ""}
            style={{
              fontFamily: "GeistSans",
              fontSize: 16,
              color: t.foreground,
              lineHeight: 24,
              minHeight: 120,
              textAlignVertical: "top",
            }}
            scrollEnabled={false}
          />
        </ScrollView>

        {/* "Edit with AI" voice button */}
        {!keyboardVisible && (
          <>
            <View
              style={{
                height: 1,
                backgroundColor: t.border,
                marginHorizontal: 16,
              }}
            />
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <Pressable
                onPressIn={handleRecordStart}
                onPressOut={handleRecordStop}
                disabled={aiShare.isLoading && !aiShare.text}
                style={{
                  height: 48,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {isRecording ? (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#E5484D",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Stop size={16} color="#FFFFFF" weight="fill" />
                    <Text
                      style={{
                        fontFamily: "GeistSans-Medium",
                        fontSize: 16,
                        color: "#FFFFFF",
                      }}
                    >
                      Recording...
                    </Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={["#86EFAC", "#22C55E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkle size={16} color="#FFFFFF" weight="fill" />
                    <Text
                      style={{
                        fontFamily: "GeistSans-Medium",
                        fontSize: 16,
                        color: "#FFFFFF",
                      }}
                    >
                      Edit with AI
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
              {isRecording && transcript ? (
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: "GeistSans",
                    fontSize: 13,
                    color: t.foregroundMuted,
                    marginTop: 6,
                  }}
                >
                  {transcript}
                </Text>
              ) : null}
            </View>
          </>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: t.border }} />

        {/* Bottom buttons — hidden when keyboard visible */}
        {!keyboardVisible && (
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            {/* Send button */}
            <Pressable
              onPress={handleSend}
              disabled={!aiShare.text && aiShare.isLoading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: brandColor,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: !aiShare.text && aiShare.isLoading ? 0.5 : 1,
              }}
            >
              <PaperPlaneTilt size={20} color="#FFFFFF" weight="fill" />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                {sendButtonText}
              </Text>
            </Pressable>

            {/* Copy button */}
            <Pressable
              onPress={handleCopy}
              disabled={!aiShare.text}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: t.foreground,
                alignItems: "center",
                justifyContent: "center",
                opacity: !aiShare.text ? 0.5 : 1,
              }}
            >
              <CopySimple size={20} color={t.background} weight="fill" />
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
