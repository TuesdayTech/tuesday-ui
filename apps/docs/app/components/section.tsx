import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Button, VStack, Section } from "@tuesday-ui/ui";

export default function SectionPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Section</Text>

        <Section title="Basic Section" subtitle="With a subtitle">
          <Text className="text-sm text-foreground">Section content goes here.</Text>
        </Section>

        <Section title="Collapsible Section" collapsible>
          <Text className="text-sm text-foreground">
            This content can be collapsed by tapping the header.
          </Text>
        </Section>

        <Section title="Collapsed by Default" collapsible defaultCollapsed>
          <Text className="text-sm text-foreground">Hidden by default!</Text>
        </Section>
      </VStack>
    </ScrollView>
  );
}
