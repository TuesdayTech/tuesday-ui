import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
  ref?: React.Ref<RNText>;
}

export function Text({ className, ref, ...props }: TextProps) {
  return <RNText ref={ref} className={className} {...props} />;
}
