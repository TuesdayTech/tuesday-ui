import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Text } from "../primitives/Text";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps {
  className?: string;
  size?: IconSize;
  name: string;
  color?: string;
}

const sizeClasses: Record<IconSize, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

/**
 * Simple icon wrapper using text-based icons (emoji or symbol fonts).
 * Replace with a proper icon library (lucide, phosphor) as needed.
 */
export function Icon({ className, size = "md", name, color }: IconProps) {
  return (
    <Text
      className={cn(sizeClasses[size], className)}
      style={color ? { color } : undefined}
    >
      {name}
    </Text>
  );
}
