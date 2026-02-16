import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Header, Button, VStack } from "@tuesday-ui/ui";

export default function HeaderPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Header / NavigationBar</Text>

        <Header title="Simple Header" />
        <Header title="With Back" showBack onBack={() => {}} />
        <Header
          title="With Actions"
          actions={
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          }
        />
        <Header
          title="Full Header"
          showBack
          onBack={() => {}}
          actions={
            <Button size="sm" variant="primary">
              Save
            </Button>
          }
        />
      </VStack>
    </ScrollView>
  );
}
