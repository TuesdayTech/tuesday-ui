import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, ListItem, Avatar, Badge, Button, VStack, Divider } from "@tuesday-ui/ui";

export default function ListItemPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">ListItem</Text>

        <VStack>
          <ListItem title="Simple Item" />
          <Divider />
          <ListItem title="With Subtitle" subtitle="Secondary text here" />
          <Divider />
          <ListItem
            title="With Avatar"
            subtitle="Leading content"
            leading={<Avatar size="sm" initials="AB" />}
          />
          <Divider />
          <ListItem
            title="With Trailing"
            subtitle="Badge on the right"
            trailing={<Badge color="success">New</Badge>}
          />
          <Divider />
          <ListItem
            title="Full Example"
            subtitle="Avatar + trailing action"
            leading={<Avatar size="sm" initials="CD" />}
            trailing={<Text className="text-foreground-muted text-xs">→</Text>}
            onPress={() => {}}
          />
        </VStack>
      </VStack>
    </ScrollView>
  );
}
