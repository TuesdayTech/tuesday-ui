import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Share,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import {
  useProfile,
  useProfileListings,
  useFollowMutation,
  useTrackProfileView,
} from "../../hooks/use-profile";
import { isVerified as checkVerified, type ProfileSortOrder } from "../../types/profile";
import type { Listing } from "../../types/listing";
import { isNonAgentType, getOfficeBranding } from "../../lib/profile/utils";
import { ProfileAvatar } from "../../components/profile/ProfileAvatar";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { ProfileBadge } from "../../components/profile/ProfileBadge";
import { ProfileBio } from "../../components/profile/ProfileBio";
import { ProfileLinks } from "../../components/profile/ProfileLinks";
import { ProfileButtons } from "../../components/profile/ProfileButtons";
import { ProfileGridMenu } from "../../components/profile/ProfileGridMenu";
import { ListingsGrid } from "../../components/listings/ListingsGrid";
import { ListingViewer } from "../../components/listings/ListingViewer";
import { SocialLinksSheet } from "../../components/profile/SocialLinksSheet";

// Background images for non-agent profiles
const BACKGROUNDS: Record<string, ReturnType<typeof require>> = {
  TTBackground: require("../../assets/profile/backgrounds/TTBackground.png"),
  GSBackground: require("../../assets/profile/backgrounds/GSBackground.png"),
  RLBackground: require("../../assets/profile/backgrounds/RLBackground.png"),
  NSBackground: require("../../assets/profile/backgrounds/NSBackground.png"),
  CRBackground: require("../../assets/profile/backgrounds/CRBackground.png"),
  DOBackground: require("../../assets/profile/backgrounds/DOBackground.png"),
};

export default function AgentProfileScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { uid, name } = useLocalSearchParams<{ uid: string; name?: string }>();
  const { profile: authProfile } = useAuth();
  const targetUid = uid ?? "";

  // Fetch profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useProfile(targetUid);

  // Track view
  const trackView = useTrackProfileView();
  React.useEffect(() => {
    if (targetUid && authProfile?.UID) {
      trackView.mutate({
        profileUid: authProfile.UID,
        viewedProfileUid: targetUid,
      });
    }
  }, [targetUid]);

  // Determine non-agent as soon as profile loads
  const isNonAgent = isNonAgentType(profile?.MemberType);

  // Listings — only fetch for agent profiles
  const [sortOrder, setSortOrder] = useState<ProfileSortOrder>("recent");
  const {
    data: listingsData,
    isLoading: isListingsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchListings,
  } = useProfileListings(targetUid, sortOrder, !isNonAgent && !isProfileLoading);

  const listings = useMemo(
    () =>
      (listingsData?.pages.flatMap((p) => p.listings) ?? []) as unknown as Listing[],
    [listingsData],
  );

  // Follow
  const followMutation = useFollowMutation();
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);
  const currentlyFollowing =
    optimisticFollowing ?? profile?.isFollowing ?? false;

  const handleFollowPress = () => {
    if (!authProfile?.UID || !targetUid) return;
    const newFollow = !currentlyFollowing;
    setOptimisticFollowing(newFollow);
    followMutation.mutate(
      { profileUid: authProfile.UID, targetUid, follow: newFollow },
      {
        onError: () => setOptimisticFollowing(null),
        onSettled: () => setOptimisticFollowing(null),
      },
    );
  };

  // Listing viewer
  const [listingViewer, setListingViewer] = useState<{ visible: boolean; startIndex: number }>({
    visible: false,
    startIndex: 0,
  });

  const handleListingPress = useCallback((index: number) => {
    setListingViewer({ visible: true, startIndex: index });
  }, []);

  // Sheets
  const [socialLinksVisible, setSocialLinksVisible] = useState(false);

  // Refresh
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises: Promise<unknown>[] = [refetchProfile()];
    if (!isNonAgent) promises.push(refetchListings());
    await Promise.all(promises);
    setRefreshing(false);
  }, [refetchProfile, refetchListings, isNonAgent]);

  // Pagination via parent ScrollView
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      const distanceFromEnd = contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromEnd < 500 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  // Share
  const handleSharePress = async () => {
    const agentName = profile?.MemberFullName ?? "Agent";
    try {
      await Share.share({ message: `${agentName}'s profile on Tuesday` });
    } catch {
      // User cancelled
    }
  };

  // Profile data
  const displayName = profile?.MemberFullName ?? name ?? "Profile";
  const verified = profile ? checkVerified(profile) : false;
  const isUser = profile?.isUser ?? false;
  const showStats = !isNonAgent && !isProfileLoading;

  // Non-agent branded background
  const branding = isNonAgent ? getOfficeBranding(profile?.OfficeUID) : null;

  // --- Nav bar ---
  const renderNavBar = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <CaretLeft
            size={22}
            color={isNonAgent ? "#FFFFFF" : t.foreground}
            weight="bold"
          />
        </Pressable>
        {isNonAgent ? null : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 18,
                color: t.foreground,
                maxWidth: 200,
              }}
            >
              {displayName}
            </Text>
            <ProfileBadge isVerified={verified} isUser={isUser} size={18} />
          </View>
        )}
      </View>
    </View>
  );

  // --- Main info section ---
  const renderMainInfo = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 16,
      }}
    >
      <ProfileAvatar uri={profile?.Media} name={displayName} size={84} />
      {showStats && (
        <ProfileStats
          roundedVolume={profile?.roundedVolume}
          totalTxns={profile?.totalTxns}
          roundedAverageSalesPrice={profile?.roundedAverageSalesPrice}
          startDate={profile?.startDate}
          isLoading={isProfileLoading}
        />
      )}
    </View>
  );

  // --- Name + Office below avatar ---
  const renderNameSection = () => (
    <View style={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4 }}>
      {isNonAgent && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
              color: isNonAgent ? "#FFFFFF" : t.foreground,
            }}
          >
            {displayName}
          </Text>
          <ProfileBadge
            isVerified={verified}
            isUser={isUser}
            size={18}
            color={isNonAgent ? "#FFFFFF" : undefined}
          />
        </View>
      )}
      {profile?.OfficeName ? (
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "GeistSans",
            fontSize: 12,
            color: isNonAgent ? "rgba(255,255,255,0.6)" : t.foregroundMuted,
            marginTop: isNonAgent ? 4 : 0,
          }}
        >
          {profile.OfficeName}
        </Text>
      ) : null}
    </View>
  );

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

  if (!uid) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
        {renderNavBar()}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: t.foregroundMuted, fontFamily: "GeistSans" }}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Agent profile (scrollable) ---
  if (!isNonAgent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
        {renderNavBar()}
        <ScrollView
          style={{ flex: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderMainInfo()}
          {renderNameSection()}

          <ProfileBio bio={profile?.MemberBio} isLoading={isProfileLoading} />

          <ProfileLinks
            phone={profile?.MemberMobilePhone}
            email={profile?.MemberEmail}
            socialLinks={profile?.MemberSocialMedia}
            isLoading={isProfileLoading}
            onSocialLinksTap={() => setSocialLinksVisible(true)}
          />

          <ProfileButtons
            isOwnProfile={false}
            isFollowing={currentlyFollowing}
            isFollowLoading={followMutation.isPending}
            onFollowPress={handleFollowPress}
            onSharePress={handleSharePress}
          />

          {/* Listings section */}
          <ProfileGridMenu
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onMapPress={() => {}}
          />

          <ListingsGrid
            listings={listings}
            isLoading={isListingsLoading}
            isFetchingMore={isFetchingNextPage}
            onListingPress={handleListingPress}
          />

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Listing viewer overlay */}
        {listingViewer.visible && listings.length > 0 && (
          <ListingViewer
            listings={listings}
            startIndex={listingViewer.startIndex}
            onClose={() => setListingViewer({ visible: false, startIndex: 0 })}
            onAgentPress={handleAgentPress}
            onAreaPress={handleAreaPress}
            profileUid={authProfile?.UID ?? ""}
          />
        )}

        {profile?.MemberSocialMedia && profile.MemberSocialMedia.length > 0 && (
          <SocialLinksSheet
            visible={socialLinksVisible}
            links={profile.MemberSocialMedia}
            onClose={() => setSocialLinksVisible(false)}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- Non-agent profile (branded background) ---
  const bgSource = branding
    ? BACKGROUNDS[branding.background] ?? BACKGROUNDS.GSBackground
    : BACKGROUNDS.GSBackground;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bgSource} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {renderNavBar()}
          <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 70 }}>
            {renderMainInfo()}
            {renderNameSection()}

            <ProfileBio bio={profile?.MemberBio} isLoading={isProfileLoading} isNonAgent />

            <ProfileLinks
              phone={profile?.MemberMobilePhone}
              email={profile?.MemberEmail}
              socialLinks={profile?.MemberSocialMedia}
              isLoading={isProfileLoading}
              isNonAgent
              onSocialLinksTap={() => setSocialLinksVisible(true)}
            />

            <ProfileButtons
              isOwnProfile={false}
              isFollowing={currentlyFollowing}
              isFollowLoading={followMutation.isPending}
              onFollowPress={handleFollowPress}
              onSharePress={handleSharePress}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>

      {profile?.MemberSocialMedia && profile.MemberSocialMedia.length > 0 && (
        <SocialLinksSheet
          visible={socialLinksVisible}
          links={profile.MemberSocialMedia}
          onClose={() => setSocialLinksVisible(false)}
        />
      )}
    </View>
  );
}
