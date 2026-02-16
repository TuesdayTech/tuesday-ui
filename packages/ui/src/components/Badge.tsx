import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export type BadgeColor = "default" | "success" | "warning" | "error" | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  className?: string;
  color?: BadgeColor;
  size?: BadgeSize;
  children: React.ReactNode;
}

const colorClasses: Record<BadgeColor, string> = {
  default: "bg-background-tertiary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

const textColorClasses: Record<BadgeColor, string> = {
  default: "text-foreground",
  success: "text-white",
  warning: "text-black",
  error: "text-white",
  info: "text-white",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 rounded",
  md: "px-2 py-1 rounded-md",
};

const textSizeClasses: Record<BadgeSize, string> = {
  sm: "text-xs",
  md: "text-sm",
};

export function Badge({
  className,
  color = "default",
  size = "sm",
  children,
}: BadgeProps) {
  return (
    <Box className={cn(colorClasses[color], sizeClasses[size], className)}>
      <Text className={cn(textColorClasses[color], textSizeClasses[size], "font-medium")}>
        {children}
      </Text>
    </Box>
  );
}
