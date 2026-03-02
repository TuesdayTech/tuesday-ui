import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Heart } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useOptimisticLike } from "../../hooks/use-listing-actions";
import { useThemeColors } from "../../hooks/useThemeColors";

interface LikeButtonProps {
  listingUid: string;
  profileUid: string;
  isLiked: boolean;
  likesCount: number;
  disabled?: boolean;
  onCountPress?: () => void;
}

export function LikeButton({
  listingUid,
  profileUid,
  isLiked,
  likesCount,
  disabled,
  onCountPress,
}: LikeButtonProps) {
  const t = useThemeColors();
  const likeMutation = useOptimisticLike(listingUid, profileUid);

  // Local optimistic state — instant visual feedback
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localCount, setLocalCount] = useState(likesCount);

  // Sync with server truth when props change (e.g. refetch)
  useEffect(() => {
    setLocalLiked(isLiked);
    setLocalCount(likesCount);
  }, [isLiked, likesCount]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    const newLiked = !localLiked;

    // Instant local update (prevent going below 0)
    setLocalLiked(newLiked);
    setLocalCount((c) => Math.max(0, c + (newLiked ? 1 : -1)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    // Fire API — revert on failure
    likeMutation.mutate(
      { isLike: newLiked },
      {
        onError: () => {
          setLocalLiked(!newLiked);
          setLocalCount((c) => Math.max(0, c + (newLiked ? -1 : 1)));
        },
      },
    );
  }, [disabled, localLiked, likeMutation]);

  const iconColor = localLiked ? "#E5484D" : t.foreground;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        hitSlop={6}
        style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}
      >
        <Heart
          size={24}
          color={iconColor}
          weight={localLiked ? "fill" : "bold"}
        />
      </Pressable>

      <Pressable
        onPress={onCountPress}
        disabled={disabled}
        hitSlop={6}
        style={{ opacity: localCount > 0 ? 1 : 0 }}
      >
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 12,
            color: t.foreground,
            width: Math.max(1, String(localCount).length) * 10,
            textAlign: "center",
          }}
        >
          {localCount}
        </Text>
      </Pressable>
    </View>
  );
}
