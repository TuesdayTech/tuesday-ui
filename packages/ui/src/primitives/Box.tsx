import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface BoxProps extends ViewProps {
  className?: string;
  ref?: React.Ref<View>;
}

export function Box({ className, ref, ...props }: BoxProps) {
  return <View ref={ref} className={className} {...props} />;
}
