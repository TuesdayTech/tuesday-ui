import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LockSimple } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { Playlist } from "../../types/playlist";

interface PlaylistCardProps {
  playlist: Playlist;
  width: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function PlaylistCard({ playlist, width, onPress, onLongPress }: PlaylistCardProps) {
  const t = useThemeColors();
  const images = playlist.listings ?? [];
  const imageCount = images.length;

  const subtitle = getSubtitle(playlist);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View style={{ width, gap: 8 }}>
        {/* Image section */}
        <View
          style={{
            width,
            height: width,
            backgroundColor: t.backgroundSecondary,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {imageCount === 0 ? null : imageCount === 1 ? (
            <Image
              source={{ uri: images[0] }}
              style={{ width, height: width }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : imageCount === 2 ? (
            <TwoImageGrid images={images} width={width} />
          ) : (
            <FourImageGrid images={images} width={width} />
          )}
        </View>

        {/* Title + subtitle */}
        <View style={{ paddingHorizontal: 4, gap: 4 }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 15,
              lineHeight: 20,
              color: t.foreground,
            }}
          >
            {playlist.title ?? "Untitled"}
          </Text>

          {(subtitle || playlist.isPublic === false) && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              {playlist.isPublic === false && (
                <LockSimple size={12} color={t.foregroundMuted} weight="fill" />
              )}
              {subtitle ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "GeistSans-Light",
                    fontSize: 12,
                    lineHeight: 16,
                    color: t.foregroundMuted,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function TwoImageGrid({ images, width }: { images: string[]; width: number }) {
  const half = (width - 2) / 2;
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {images.slice(0, 2).map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{ width: half, height: width }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ))}
    </View>
  );
}

function FourImageGrid({ images, width }: { images: string[]; width: number }) {
  const half = (width - 2) / 2;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
      {images.slice(0, 4).map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{ width: half, height: half }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ))}
    </View>
  );
}

function getSubtitle(playlist: Playlist): string {
  const clients = playlist.clients;
  if (clients && clients.length > 0) {
    const names = clients
      .map((c) => {
        if (c.name && c.surname) return `${c.name} ${c.surname}`;
        if (c.name) return c.name;
        return null;
      })
      .filter(Boolean);
    if (names.length > 0) return `for ${names.join(", ")}`;
  }

  if (playlist.clientName) return `for ${playlist.clientName}`;

  return "";
}
