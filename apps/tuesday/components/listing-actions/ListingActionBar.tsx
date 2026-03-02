import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PaperPlaneTilt } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useShareLink } from "../../hooks/use-listing-actions";
import type { ListingActionBarProps } from "../../types/listing-actions";
import type { ShareType } from "../../types/listing-actions";
import { LikeButton } from "./LikeButton";
import { ScheduleButton } from "./ScheduleButton";
import { CommentButton } from "./CommentButton";
import { CommentsSheet } from "./CommentsSheet";
import { SocialNetworkSheet } from "./SocialNetworkSheet";
import { SmartShareSheet } from "./SmartShareSheet";
import { InstagramStoryFlow } from "./InstagramStoryFlow";
import { InstagramTemplatesSheet } from "./InstagramTemplatesSheet";

export function ListingActionBar({
  listingUid,
  listing,
  profileUid,
  isLoading,
}: ListingActionBarProps) {
  const t = useThemeColors();
  const router = useRouter();
  const { generate: generateShareLink, isGenerating } = useShareLink(profileUid);
  // TODO: re-enable Smart Share daily limit later
  // const { isLimitReached, isChecking, recordUsage } = useSmartShareLimit(listingUid);

  // Bottom sheet refs
  const commentsSheetRef = useRef<BottomSheetModal>(null);
  const socialNetworkSheetRef = useRef<BottomSheetModal>(null);
  const smartShareSheetRef = useRef<BottomSheetModal>(null);
  const instagramTemplatesRef = useRef<BottomSheetModal>(null);

  // Share state
  const [shareLink, setShareLink] = useState("");
  const [selectedShareType, setSelectedShareType] = useState<ShareType | null>(null);

  // Instagram Story flow
  const [instagramFlowVisible, setInstagramFlowVisible] = useState(false);

  // Comments count (local, updated from sheet — syncs with server data)
  const [localCommentsCount, setLocalCommentsCount] = useState(
    listing.CommentsCount ?? 0,
  );

  // Sync when listing data refreshes from server
  useEffect(() => {
    setLocalCommentsCount(listing.CommentsCount ?? 0);
  }, [listing.CommentsCount]);

  // ─── Share ─────────────────────────────────────────────────────────

  const handleSharePress = useCallback(async () => {
    if (isLoading || isGenerating) return;

    try {
      const link = await generateShareLink(listingUid);
      setShareLink(link);
      socialNetworkSheetRef.current?.present();
    } catch (err) {
      if (__DEV__) console.log("[Share] generateShareLink failed:", err);
      Share.share({ message: listing.UnparsedAddress ?? "Check out this listing!" });
    }
  }, [isLoading, isGenerating, generateShareLink, listingUid, listing.UnparsedAddress]);

  const handleSocialNetworkSelect = useCallback(
    (type: ShareType) => {
      setSelectedShareType(type);

      // 300ms delay as per spec
      setTimeout(() => {
        if (type === "More") {
          // Native share (UIActivityViewController equivalent)
          const text = shareLink || listing.UnparsedAddress || "Check out this listing!";
          Share.share({ message: text });
        } else if (type === "IGstory") {
          // Instagram Stories → photo-based flow (full-screen modal)
          setInstagramFlowVisible(true);
        } else {
          // SMS, Email, Facebook, XPost → Smart Share sheet with AI text
          smartShareSheetRef.current?.present();
        }
      }, 300);
    },
    [shareLink, listing.UnparsedAddress],
  );

  // ─── Comments ──────────────────────────────────────────────────────

  const handleCommentsPress = useCallback(() => {
    commentsSheetRef.current?.present();
  }, []);

  // ─── Likes ─────────────────────────────────────────────────────────

  const handleLikesCountPress = useCallback(() => {
    router.push(`/listing/likes/${listingUid}` as never);
  }, [router, listingUid]);

  // ─── Instagram Templates ─────────────────────────────────────────

  const handleOpenTemplates = useCallback(() => {
    instagramTemplatesRef.current?.present();
  }, []);

  return (
    <>
      {/* Action Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingLeft: 12,
          paddingRight: 76,
          paddingVertical: 12,
        }}
      >
        {/* Share button (primary, fills remaining space) */}
        <Pressable
          onPress={handleSharePress}
          disabled={isLoading}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 40,
            borderRadius: 6,
            backgroundColor: t.foreground,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <PaperPlaneTilt size={20} color={t.background} />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 20,
              color: t.background,
            }}
          >
            Share
          </Text>
        </Pressable>

        {/* Schedule */}
        <ScheduleButton
          listingUid={listingUid}
          profileUid={profileUid}
          standardStatus={listing.StandardStatus}
          disabled={isLoading}
        />

        {/* Comment */}
        <CommentButton
          commentsCount={localCommentsCount}
          disabled={isLoading}
          onPress={handleCommentsPress}
        />

        {/* Like */}
        <LikeButton
          listingUid={listingUid}
          profileUid={profileUid}
          isLiked={listing.isLiked ?? false}
          likesCount={listing.LikesCount ?? 0}
          disabled={isLoading}
          onCountPress={handleLikesCountPress}
        />
      </View>

      {/* Bottom sheets */}
      <CommentsSheet
        listingUid={listingUid}
        profileUid={profileUid}
        bottomSheetRef={commentsSheetRef}
        onCommentsCountChange={setLocalCommentsCount}
      />

      <SocialNetworkSheet
        bottomSheetRef={socialNetworkSheetRef}
        onSelect={handleSocialNetworkSelect}
      />

      <SmartShareSheet
        bottomSheetRef={smartShareSheetRef}
        shareType={selectedShareType}
        listingUid={listingUid}
        profileUid={profileUid}
        address={listing.UnparsedAddress}
        photoUrl={listing.PreferredPhoto ?? listing.Photos?.[0]}
        shareLink={shareLink}
        playlistUID={listing.PlaylistInfo?.playlistUID}
        onOpenTemplates={handleOpenTemplates}
      />

      {/* Instagram Story full-screen modal */}
      {instagramFlowVisible && (
        <InstagramStoryFlow
          visible={instagramFlowVisible}
          onClose={() => setInstagramFlowVisible(false)}
          listing={listing}
          shareLink={shareLink}
        />
      )}

      {/* Instagram Templates sheet */}
      <InstagramTemplatesSheet
        bottomSheetRef={instagramTemplatesRef}
        listing={listing}
        shareLink={shareLink}
      />
    </>
  );
}
