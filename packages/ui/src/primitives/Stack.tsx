import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@tuesday-ui/utils';

export interface StackProps extends ViewProps {
  className?: string;
  gap?: number;
}

export const VStack = React.forwardRef<View, StackProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn('flex flex-col', className)} {...props} />;
  }
);
VStack.displayName = 'VStack';

export const HStack = React.forwardRef<View, StackProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn('flex flex-row', className)} {...props} />;
  }
);
HStack.displayName = 'HStack';

/** Stack defaults to vertical (VStack) */
export const Stack = VStack;
