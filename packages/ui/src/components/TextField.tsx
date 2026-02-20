import React, { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface TextFieldProps extends Omit<TextInputProps, "className"> {
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  ref?: React.Ref<TextInput>;
}

export function TextField({
  className,
  label,
  helperText,
  error,
  disabled,
  icon,
  ref,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Box className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      <Box
        className={cn(
          "flex-row items-center rounded-md border bg-background-secondary px-3 h-10",
          focused && "border-accent",
          error && "border-error",
          !focused && !error && "border-border",
          disabled && "opacity-50",
          className
        )}
      >
        {icon && <Box className="mr-2">{icon}</Box>}
        <TextInput
          ref={ref}
          editable={!disabled}
          placeholderTextColor="#707070"
          className="flex-1 text-foreground text-sm"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </Box>
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
