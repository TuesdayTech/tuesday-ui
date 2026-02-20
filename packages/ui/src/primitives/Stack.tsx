import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@tuesday-ui/utils';

export interface StackProps extends ViewProps {
  className?: string;
  gap?: number;
  ref?: React.Ref<View>;
}

export function VStack({ className, ref, ...props }: StackProps) {
  return <View ref={ref} className={cn('flex flex-col', className)} {...props} />;
}

export function HStack({ className, ref, ...props }: StackProps) {
  return <View ref={ref} className={cn('flex flex-row', className)} {...props} />;
}

/** Stack defaults to vertical (VStack) */
export const Stack = VStack;
