import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface EmptyStateProps {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box className={cn("items-center justify-center py-12 px-6 gap-3", className)}>
      {icon && <Box className="mb-2">{icon}</Box>}
      <Text className="text-lg font-semibold text-foreground text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-foreground-muted text-center max-w-xs">
          {description}
        </Text>
      )}
      {action && <Box className="mt-3">{action}</Box>}
    </Box>
  );
}
