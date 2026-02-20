import React from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type View,
} from 'react-native';

export interface PressableProps extends RNPressableProps {
  className?: string;
  ref?: React.Ref<View>;
}

export function Pressable({ className, ref, ...props }: PressableProps) {
  return <RNPressable ref={ref} className={className} {...props} />;
}
