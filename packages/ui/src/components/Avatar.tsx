import React from "react";
import { Image, type ImageSourcePropType, type View } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  className?: string;
  size?: AvatarSize;
  source?: ImageSourcePropType;
  initials?: string;
  fallback?: React.ReactNode;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8 rounded-full",
  md: "w-10 h-10 rounded-full",
  lg: "w-14 h-14 rounded-full",
  xl: "w-20 h-20 rounded-full",
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

export function Avatar({
  className,
  size = "md",
  source,
  initials,
  fallback,
}: AvatarProps) {
  if (source) {
    return (
      <Image
        source={source}
        className={cn(sizeClasses[size], className)}
        resizeMode="cover"
      />
    );
  }

  return (
    <Box
      className={cn(
        sizeClasses[size],
        "items-center justify-center bg-background-tertiary",
        className
      )}
    >
      {initials ? (
        <Text
          className={cn(
            "font-semibold text-foreground",
            textSizeClasses[size]
          )}
        >
          {initials}
        </Text>
      ) : (
        fallback ?? (
          <Text className={cn("text-foreground-muted", textSizeClasses[size])}>
            ?
          </Text>
        )
      )}
    </Box>
  );
}
