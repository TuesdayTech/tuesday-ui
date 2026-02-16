import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Text } from "../primitives/Text";

export interface ChipProps {
  className?: string;
  label: string;
  selected?: boolean;
  deletable?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}

export function Chip({
  className,
  label,
  selected = false,
  deletable = false,
  onPress,
  onDelete,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-full px-3 py-1.5 border",
        selected
          ? "bg-accent border-accent"
          : "bg-background-secondary border-border",
        className
      )}
    >
      <Text
        className={cn(
          "text-sm",
          selected ? "text-white" : "text-foreground"
        )}
      >
        {label}
      </Text>
      {deletable && (
        <Pressable onPress={onDelete} className="ml-1.5">
          <Text
            className={cn(
              "text-xs",
              selected ? "text-white/70" : "text-foreground-muted"
            )}
          >
            ✕
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
