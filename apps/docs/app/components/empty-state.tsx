import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, EmptyState, Button, VStack } from "@tuesday-ui/ui";

export default function EmptyStatePage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">EmptyState</Text>

        <EmptyState
          icon={<Text className="text-4xl">📭</Text>}
          title="No messages yet"
          description="When you receive messages, they'll appear here."
        />

        <EmptyState
          icon={<Text className="text-4xl">🔍</Text>}
          title="No results found"
          description="Try adjusting your search or filters."
          action={<Button size="sm">Clear Filters</Button>}
        />
      </VStack>
    </ScrollView>
  );
}
