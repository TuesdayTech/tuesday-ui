import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Header, Section, Badge, Avatar, Divider,
  Card, CardBody,
} from "@tuesday-ui/ui";

export default function DetailScreen() {
  return (
    <VStack className="flex-1 bg-background">
      <Header
        title="Profile"
        showBack
        actions={
          <Link href="/" asChild>
            <Button variant="ghost" size="sm">Docs</Button>
          </Link>
        }
      />

      <ScrollView className="flex-1">
        {/* Hero area */}
        <Box className="h-48 bg-accent/20 items-center justify-center">
          <Text className="text-6xl">🎨</Text>
        </Box>

        <VStack className="px-6 -mt-10 gap-4">
          <HStack className="items-end gap-4">
            <Avatar size="xl" initials="AJ" className="border-4 border-background" />
            <VStack className="flex-1 gap-1 pb-1">
              <Text className="text-xl font-semibold text-foreground">Alice Johnson</Text>
              <Text className="text-sm text-foreground-muted">Senior Product Designer</Text>
            </VStack>
          </HStack>

          <HStack className="gap-2">
            <Badge color="success">Available</Badge>
            <Badge color="info">Design</Badge>
          </HStack>
        </VStack>

        <VStack className="px-6 gap-2 mt-4">
          <Section title="About">
            <Text className="text-sm text-foreground leading-relaxed">
              Passionate designer with 8+ years of experience creating user-centered digital products.
              Specializing in design systems, interaction design, and cross-platform experiences.
            </Text>
          </Section>

          <Divider />

          <Section title="Recent Work">
            <VStack className="gap-3">
              <Card>
                <CardBody>
                  <Text className="text-sm font-medium text-foreground">Design System v2.0</Text>
                  <Text className="text-xs text-foreground-muted mt-1">
                    Complete redesign of the component library with dark mode support.
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text className="text-sm font-medium text-foreground">Mobile App Redesign</Text>
                  <Text className="text-xs text-foreground-muted mt-1">
                    Led the redesign of the flagship mobile application.
                  </Text>
                </CardBody>
              </Card>
            </VStack>
          </Section>

          <Divider />

          <Section title="Contact" collapsible>
            <VStack className="gap-2">
              <Text className="text-sm text-foreground">📧 alice@example.com</Text>
              <Text className="text-sm text-foreground">🔗 linkedin.com/in/alice</Text>
            </VStack>
          </Section>
        </VStack>

        <Box className="h-12" />
      </ScrollView>
    </VStack>
  );
}
