import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAuth } from "../../../providers/auth-provider";
import { useListingLikes } from "../../../hooks/use-listing-actions";
import type { LikeProfile } from "../../../types/listing-actions";

export default function ListingLikesScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const router = useRouter();
  const t = useThemeColors();
  const { profile } = useAuth();

  const {
    data: profiles,
    isLoading,
    refetch,
    isRefetching,
  } = useListingLikes(uid ?? "", profile?.UID ?? "", !!uid && !!profile?.UID);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CaretLeft size={20} color={t.foreground} weight="bold" />
        </Pressable>
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 17,
            color: t.foreground,
          }}
        >
          Likes
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : !profiles || profiles.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 17,
              color: t.foreground,
            }}
          >
            No likes yet
          </Text>
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 15,
              color: t.foregroundMuted,
              marginTop: 4,
            }}
          >
            Be the first to like this listing
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {(profiles ?? []).map((likeProfile) => (
            <ProfileRow key={likeProfile.uid} profile={likeProfile} t={t} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ProfileRow({
  profile,
  t,
}: {
  profile: LikeProfile;
  t: ReturnType<typeof useThemeColors>;
}) {
  const hasAvatar = !!profile.avatar;
  const initial = profile.displayName?.charAt(0) ?? "?";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: hasAvatar
            ? t.backgroundSecondary
            : "rgba(147, 51, 234, 0.15)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {hasAvatar ? (
          <Image
            source={{ uri: profile.avatar }}
            style={{ width: 44, height: 44 }}
            contentFit="cover"
          />
        ) : (
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 18,
              color: "#9333EA",
            }}
          >
            {initial}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 16,
            color: t.foreground,
          }}
        >
          {profile.displayName}
        </Text>
        {profile.officeName && (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans",
              fontSize: 14,
              color: t.foregroundMuted,
              marginTop: 2,
            }}
          >
            {profile.officeName}
          </Text>
        )}
      </View>
    </View>
  );
}
