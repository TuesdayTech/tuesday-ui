import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface BoxProps extends ViewProps {
  className?: string;
}

export const Box = React.forwardRef<View, BoxProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={className} {...props} />;
  }
);

Box.displayName = 'Box';
