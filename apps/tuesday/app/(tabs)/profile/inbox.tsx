import React, { useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAuth } from "../../../providers/auth-provider";
import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationsViewed,
} from "../../../hooks/use-notifications";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { NotificationCell } from "../../../components/inbox/NotificationCell";
import type { Notification } from "../../../types/notification";

export default function InboxScreen() {
  const t = useThemeColors();
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";

  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications(profileUid);

  const deleteNotification = useDeleteNotification();
  const markViewed = useMarkNotificationsViewed();

  // Mark all notifications as viewed on mount
  useEffect(() => {
    if (!notifications || notifications.length === 0 || !profileUid) return;
    const unviewedIds = notifications
      .filter((n) => !n.isViewed)
      .map((n) => n.id);
    if (unviewedIds.length > 0) {
      markViewed.mutate({ profileUid, notificationIds: unviewedIds });
    }
  }, [notifications, profileUid]);

  const handleDelete = useCallback(
    (notificationId: number) => {
      if (!profileUid) return;
      deleteNotification.mutate({ profileUid, notificationId });
    },
    [profileUid, deleteNotification],
  );

  const filteredNotifications = useMemo(
    () => (notifications ?? []).filter((n) => !n.isDeleted),
    [notifications],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationCell notification={item} onDelete={handleDelete} />
    ),
    [handleDelete],
  );

  const keyExtractor = useCallback(
    (item: Notification) => String(item.id),
    [],
  );

  // --- Loading state ---
  if (isLoading && filteredNotifications.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
        <ScreenHeader title="Inbox" showBack />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={t.foregroundMuted} />
        </View>
      </SafeAreaView>
    );
  }

  // --- Empty state ---
  if (!isLoading && filteredNotifications.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
        <ScreenHeader title="Inbox" showBack />
        <FlatList
          data={[]}
          renderItem={() => null}
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <Text
              style={{
                fontFamily: "GeistMono-SemiBold",
                fontSize: 14,
                color: t.foregroundMuted,
              }}
            >
              No notifications
            </Text>
          }
        />
      </SafeAreaView>
    );
  }

  // --- List state ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      <ScreenHeader title="Inbox" showBack />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={filteredNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
