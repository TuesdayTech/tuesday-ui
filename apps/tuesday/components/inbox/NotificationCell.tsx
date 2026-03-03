import React, { useRef, useCallback } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Trash } from "phosphor-react-native";
import * as Linking from "expo-linking";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import { useFollowMutation } from "../../hooks/use-profile";
import { ProfileAvatar } from "../profile/ProfileAvatar";
import type { Notification } from "../../types/notification";

interface NotificationCellProps {
  notification: Notification;
  onDelete: (id: number) => void;
}

/** Format a date string as relative time (e.g. "2h ago", "3d ago"). */
function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/** Parse body text and bold any names (text before known action verbs). */
function renderBody(body?: string, t?: ReturnType<typeof useThemeColors>) {
  if (!body || !t) return null;

  // Try to find a bold segment: the first word(s) before common verbs
  const verbs = [
    " is now following",
    " liked ",
    " shared ",
    " invited ",
    " accepted ",
    " declined ",
    " added ",
  ];

  for (const verb of verbs) {
    const idx = body.indexOf(verb);
    if (idx > 0) {
      const boldPart = body.slice(0, idx);
      const rest = body.slice(idx);
      return (
        <Text
          numberOfLines={3}
          style={{
            fontFamily: "GeistSans",
            fontSize: 14,
            color: t.foreground,
            lineHeight: 19,
          }}
        >
          <Text style={{ fontFamily: "GeistSans-SemiBold" }}>{boldPart}</Text>
          {rest}
        </Text>
      );
    }
  }

  // Fallback — no bold
  return (
    <Text
      numberOfLines={3}
      style={{
        fontFamily: "GeistSans",
        fontSize: 14,
        color: t.foreground,
        lineHeight: 19,
      }}
    >
      {body}
    </Text>
  );
}

export function NotificationCell({ notification, onDelete }: NotificationCellProps) {
  const t = useThemeColors();
  const router = useRouter();
  const { profile: authProfile } = useAuth();
  const followMutation = useFollowMutation();
  const swipeableRef = useRef<Swipeable>(null);

  const type = notification.type;

  // Optimistic follow state
  const [localFollowing, setLocalFollowing] = React.useState<boolean | null>(null);
  const isFollowing = localFollowing ?? notification.isFollowing ?? false;

  const handleFollowToggle = useCallback(() => {
    if (!authProfile?.UID || !notification.followerUID) return;
    const newFollow = !isFollowing;
    setLocalFollowing(newFollow);
    followMutation.mutate(
      {
        profileUid: authProfile.UID,
        targetUid: notification.followerUID,
        follow: newFollow,
      },
      { onError: () => setLocalFollowing(null) },
    );
  }, [authProfile?.UID, notification.followerUID, isFollowing, followMutation]);

  const handleCellPress = useCallback(() => {
    switch (type) {
      case "follow":
        if (notification.followerUID) {
          router.push(`/agent/${notification.followerUID}`);
        }
        break;
      case "like":
      case "share":
        if (notification.listingUID) {
          router.push(`/listing/${notification.listingUID}`);
        }
        break;
      case "all":
        if (notification.link) {
          Linking.openURL(notification.link);
        }
        break;
      case "playlistListing":
        if (
          notification.listingsInfo &&
          notification.listingsInfo.length === 1 &&
          notification.listingsInfo[0].listingUID
        ) {
          router.push(`/listing/${notification.listingsInfo[0].listingUID}`);
        }
        break;
      default:
        break;
    }
  }, [type, notification, router]);

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    onDelete(notification.id);
  }, [notification.id, onDelete]);

  // --- Trailing action (right side of cell) ---
  const renderTrailing = () => {
    switch (type) {
      case "like":
        if (notification.listingHeroPhoto) {
          return (
            <Pressable
              onPress={() => {
                if (notification.listingUID) {
                  router.push(`/listing/${notification.listingUID}`);
                }
              }}
            >
              <Image
                source={{ uri: notification.listingHeroPhoto }}
                style={{ width: 40, height: 40, borderRadius: 6 }}
                resizeMode="cover"
              />
            </Pressable>
          );
        }
        return null;

      case "follow":
        return (
          <Pressable
            onPress={handleFollowToggle}
            style={{
              width: 100,
              height: 32,
              borderRadius: 8,
              backgroundColor: isFollowing ? t.background : t.foreground,
              borderWidth: isFollowing ? 1.5 : 0,
              borderColor: t.foreground,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 12,
                color: isFollowing ? t.foreground : t.background,
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        );

      case "playlistInvitation":
        return (
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Pressable
              style={{
                width: 72,
                height: 32,
                borderRadius: 8,
                backgroundColor: t.backgroundTertiary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 12,
                  color: t.foreground,
                }}
              >
                Decline
              </Text>
            </Pressable>
            <Pressable
              style={{
                width: 72,
                height: 32,
                borderRadius: 8,
                backgroundColor: t.foreground,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 12,
                  color: t.background,
                }}
              >
                Accept
              </Text>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  // --- Swipe-to-delete right action ---
  const renderRightActions = () => (
    <Pressable
      onPress={handleDelete}
      style={{
        width: 72,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Trash size={20} color="#FFFFFF" weight="bold" />
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable
        onPress={handleCellPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 10,
          backgroundColor: t.background,
          minHeight: 60,
        }}
      >
        {/* Avatar */}
        <ProfileAvatar
          uri={notification.avatar}
          name={notification.displayName}
          size={40}
        />

        {/* Body + timestamp */}
        <View style={{ flex: 1 }}>
          {renderBody(notification.body, t)}
          <Text
            style={{
              fontFamily: "GeistSans",
              fontSize: 12,
              color: t.foregroundMuted,
              marginTop: 2,
            }}
          >
            {timeAgo(notification.createdAt)}
          </Text>
        </View>

        {/* Trailing action */}
        {renderTrailing()}
      </Pressable>
    </Swipeable>
  );
}
