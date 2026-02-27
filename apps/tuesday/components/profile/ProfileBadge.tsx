import React from "react";
import { View, Text } from "react-native";
import { ShieldCheck, UserCircleCheck } from "phosphor-react-native";

interface ProfileBadgeProps {
  isVerified: boolean;
  isUser?: boolean;
  size?: number;
  color?: string;
}

export function ProfileBadge({ isVerified, isUser, size = 18, color }: ProfileBadgeProps) {
  if (isVerified) {
    return <ShieldCheck size={size} color={color ?? "#0A84FF"} weight="fill" />;
  }
  if (isUser) {
    return <UserCircleCheck size={size} color={color ?? "#0A84FF"} weight="fill" />;
  }
  return null;
}
