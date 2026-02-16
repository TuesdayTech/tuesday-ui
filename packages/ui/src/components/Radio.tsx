import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface RadioProps {
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
}

export function Radio({
  className,
  selected = false,
  disabled = false,
  label,
  onPress,
}: RadioProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn("flex-row items-center gap-2", disabled && "opacity-50", className)}
    >
      <Box
        className={cn(
          "w-5 h-5 rounded-full border-2 items-center justify-center",
          selected ? "border-accent" : "border-border"
        )}
      >
        {selected && <Box className="w-2.5 h-2.5 rounded-full bg-accent" />}
      </Box>
      {label && <Text className="text-sm text-foreground">{label}</Text>}
    </Pressable>
  );
}
