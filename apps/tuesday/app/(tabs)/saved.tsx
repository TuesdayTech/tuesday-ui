import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "phosphor-react-native";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PlaylistCard } from "../../components/saved/PlaylistCard";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import {
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
} from "../../hooks/use-playlists";
import type { Playlist } from "../../types/playlist";

const PADDING = 16;
const GRID_GAP = 16;

export default function SavedScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";

  const { data: playlists, isLoading, refetch } = usePlaylists(profileUid);
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - PADDING * 2 - GRID_GAP) / 2;

  const { clientPlaylists, personalPlaylists } = useMemo(() => {
    const all = playlists ?? [];
    const personal = all.filter(
      (p) =>
        (!p.clients || p.clients.length === 0) &&
        (!p.clientUIDs || p.clientUIDs.length === 0) &&
        !p.clientName,
    );
    const client = all.filter((p) => !personal.includes(p));
    return { clientPlaylists: client, personalPlaylists: personal };
  }, [playlists]);

  const handleOpenPlaylist = useCallback(
    (uid: string) => {
      router.push(`/playlist/${uid}`);
    },
    [router],
  );

  const handleCreatePersonal = useCallback(() => {
    if (!profileUid) return;
    createPlaylist.mutate(
      { profileUid },
      {
        onSuccess: (playlist) => {
          router.push(`/playlist/${playlist.UID}`);
        },
      },
    );
  }, [profileUid, createPlaylist, router]);

  const handleCreateClient = useCallback(() => {
    if (!profileUid) return;
    createPlaylist.mutate(
      { profileUid },
      {
        onSuccess: (playlist) => {
          router.push(`/playlist/${playlist.UID}`);
        },
      },
    );
  }, [profileUid, createPlaylist, router]);

  const handleDelete = useCallback(
    (playlist: Playlist) => {
      Alert.alert(
        "Delete saved search",
        `Are you sure you want to delete "${playlist.title ?? "Untitled"}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deletePlaylist.mutate({
                profileUid,
                playlistUid: playlist.UID,
              });
            },
          },
        ],
      );
    },
    [profileUid, deletePlaylist],
  );

  if (isLoading && !playlists) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.background }}
        edges={["top"]}
      >
        <ScreenHeader title="Saved searches" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={t.foreground} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.background }}
      edges={["top"]}
    >
      <ScreenHeader title="Saved searches" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingTop: 20,
          paddingBottom: 80,
          gap: 20,
        }}
      >
        {/* Client searches section */}
        <View style={{ gap: 20 }}>
          <SectionTitle
            title="Client searches"
            onAdd={handleCreateClient}
            color={t.foreground}
          />
          {clientPlaylists.length > 0 ? (
            <PlaylistGrid
              playlists={clientPlaylists}
              cardWidth={cardWidth}
              onPress={handleOpenPlaylist}
              onLongPress={handleDelete}
            />
          ) : (
            <EmptySection
              title="No client searches yet"
              caption="Create one and see listings for your client"
              width={screenWidth - PADDING * 2}
              foreground={t.foreground}
              muted={t.foregroundMuted}
            />
          )}
        </View>

        {/* Personal searches section */}
        <View style={{ gap: 20 }}>
          <SectionTitle
            title="Personal searches"
            onAdd={handleCreatePersonal}
            color={t.foreground}
          />
          {personalPlaylists.length > 0 ? (
            <PlaylistGrid
              playlists={personalPlaylists}
              cardWidth={cardWidth}
              onPress={handleOpenPlaylist}
              onLongPress={handleDelete}
            />
          ) : (
            <EmptySection
              title="No personal searches yet"
              caption="Create one to follow the market"
              width={screenWidth - PADDING * 2}
              foreground={t.foreground}
              muted={t.foregroundMuted}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  onAdd,
  color,
}: {
  title: string;
  onAdd: () => void;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: 20,
          lineHeight: 26,
          color,
        }}
      >
        {title}
      </Text>
      <Pressable hitSlop={8} onPress={onAdd}>
        <Plus size={24} color={color} weight="regular" />
      </Pressable>
    </View>
  );
}

function PlaylistGrid({
  playlists,
  cardWidth,
  onPress,
  onLongPress,
}: {
  playlists: Playlist[];
  cardWidth: number;
  onPress: (uid: string) => void;
  onLongPress: (playlist: Playlist) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GRID_GAP,
      }}
    >
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.UID}
          playlist={playlist}
          width={cardWidth}
          onPress={() => onPress(playlist.UID)}
          onLongPress={() => onLongPress(playlist)}
        />
      ))}
    </View>
  );
}

function EmptySection({
  title,
  caption,
  width,
  foreground,
  muted,
}: {
  title: string;
  caption: string;
  width: number;
  foreground: string;
  muted: string;
}) {
  return (
    <View
      style={{
        width,
        height: 150,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: 20,
          lineHeight: 26,
          color: foreground,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "GeistSans",
          fontSize: 15,
          lineHeight: 20,
          color: muted,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {caption}
      </Text>
    </View>
  );
}
