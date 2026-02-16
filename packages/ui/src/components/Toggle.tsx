import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";

export interface ToggleProps {
  className?: string;
  value?: boolean;
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
}

export function Toggle({
  className,
  value = false,
  disabled = false,
  onValueChange,
}: ToggleProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      className={cn(
        "w-12 h-7 rounded-full p-0.5 justify-center",
        value ? "bg-accent" : "bg-background-tertiary",
        disabled && "opacity-50",
        className
      )}
    >
      <Box
        className={cn(
          "w-6 h-6 rounded-full bg-white",
          value ? "self-end" : "self-start"
        )}
      />
    </Pressable>
  );
}
