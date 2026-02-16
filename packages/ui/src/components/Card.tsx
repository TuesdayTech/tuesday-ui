import React from "react";
import { Image, type ImageSourcePropType } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <Box
      className={cn(
        "rounded-lg border border-border bg-background-secondary overflow-hidden",
        className
      )}
    >
      {children}
    </Box>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <Box className={cn("px-4 pt-4 pb-2", className)}>{children}</Box>;
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <Box className={cn("px-4 py-2", className)}>{children}</Box>;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      className={cn(
        "px-4 pb-4 pt-2 flex-row items-center gap-2",
        className
      )}
    >
      {children}
    </Box>
  );
}

export function CardImage({
  className,
  source,
}: {
  className?: string;
  source: ImageSourcePropType;
}) {
  return (
    <Image
      source={source}
      className={cn("w-full h-48", className)}
      resizeMode="cover"
    />
  );
}
