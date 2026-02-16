import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface CheckboxProps {
  className?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  onValueChange?: (checked: boolean) => void;
}

export function Checkbox({
  className,
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onValueChange,
}: CheckboxProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange?.(!checked)}
      className={cn("flex-row items-center gap-2", disabled && "opacity-50", className)}
    >
      <Box
        className={cn(
          "w-5 h-5 rounded border items-center justify-center",
          checked || indeterminate
            ? "bg-accent border-accent"
            : "border-border bg-transparent"
        )}
      >
        {checked && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
        {indeterminate && !checked && (
          <Box className="w-2.5 h-0.5 bg-white rounded-full" />
        )}
      </Box>
      {label && <Text className="text-sm text-foreground">{label}</Text>}
    </Pressable>
  );
}
