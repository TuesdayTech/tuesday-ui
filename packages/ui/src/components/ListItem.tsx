import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface ListItemProps {
  className?: string;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

export function ListItem({
  className,
  title,
  subtitle,
  leading,
  trailing,
  onPress,
}: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center px-4 py-3 gap-3",
        className
      )}
    >
      {leading && <Box>{leading}</Box>}
      <Box className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-foreground-muted">{subtitle}</Text>
        )}
      </Box>
      {trailing && <Box>{trailing}</Box>}
    </Pressable>
  );
}
