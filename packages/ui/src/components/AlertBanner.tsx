import React, { useState } from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export type AlertBannerVariant = "info" | "success" | "warning" | "error";

export interface AlertBannerProps {
  className?: string;
  variant?: AlertBannerVariant;
  title?: string;
  message: string;
  dismissable?: boolean;
  onDismiss?: () => void;
}

const variantClasses: Record<AlertBannerVariant, string> = {
  info: "bg-info/10 border-info/30",
  success: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
  error: "bg-error/10 border-error/30",
};

const variantTextClasses: Record<AlertBannerVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const iconMap: Record<AlertBannerVariant, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export function AlertBanner({
  className,
  variant = "info",
  title,
  message,
  dismissable = false,
  onDismiss,
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Box
      className={cn(
        "flex-row items-start rounded-lg border px-4 py-3 gap-3",
        variantClasses[variant],
        className
      )}
    >
      <Text className="text-base">{iconMap[variant]}</Text>
      <Box className="flex-1 gap-0.5">
        {title && (
          <Text className={cn("text-sm font-semibold", variantTextClasses[variant])}>
            {title}
          </Text>
        )}
        <Text className="text-sm text-foreground">{message}</Text>
      </Box>
      {dismissable && (
        <Pressable
          onPress={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <Text className="text-foreground-muted text-sm">✕</Text>
        </Pressable>
      )}
    </Box>
  );
}
