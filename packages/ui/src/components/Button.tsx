import React from 'react';
import { ActivityIndicator, type View } from 'react-native';
import { cn } from '@tuesday-ui/utils';
import { Pressable, type PressableProps } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  ref?: React.Ref<View>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-background-secondary',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  destructive: 'bg-error',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-white font-semibold',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 rounded-sm',
  md: 'h-10 px-4 rounded-md',
  lg: 'h-12 px-6 rounded-lg',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#A1A1A1'}
        />
      ) : (
        <Text
          className={cn(
            variantTextClasses[variant],
            sizeTextClasses[size]
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
