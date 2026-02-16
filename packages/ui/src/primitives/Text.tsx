import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => {
    return <RNText ref={ref} className={className} {...props} />;
  }
);

Text.displayName = 'Text';
