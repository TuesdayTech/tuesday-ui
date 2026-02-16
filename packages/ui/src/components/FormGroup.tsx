import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface FormGroupProps {
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormGroup({
  className,
  label,
  helperText,
  error,
  children,
}: FormGroupProps) {
  return (
    <Box className={cn("gap-1.5", className)}>
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      {children}
      {(error || helperText) && (
        <Text
          className={cn(
            "text-xs",
            error ? "text-error" : "text-foreground-muted"
          )}
        >
          {error || helperText}
        </Text>
      )}
    </Box>
  );
}
