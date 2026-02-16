import React from "react";
import { ActivityIndicator } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  className?: string;
  size?: SpinnerSize;
  color?: string;
}

const sizeMap: Record<SpinnerSize, "small" | "large"> = {
  sm: "small",
  md: "small",
  lg: "large",
};

export function Spinner({
  className,
  size = "md",
  color = "#0A84FF",
}: SpinnerProps) {
  return (
    <Box className={cn("items-center justify-center", className)}>
      <ActivityIndicator size={sizeMap[size]} color={color} />
    </Box>
  );
}
