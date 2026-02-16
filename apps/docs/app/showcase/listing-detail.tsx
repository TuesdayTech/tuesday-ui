import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Card, CardBody, Avatar, Section, Divider,
} from "@tuesday-ui/ui";

export default function ListingDetail() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="max-w-xl mx-auto gap-0">
        <Box className="h-64 bg-sky-400" />

        <VStack className="p-6 gap-6">
          <Link href="/showcase" asChild>
            <Button variant="ghost" size="sm">← Back to Showcase</Button>
          </Link>

          <VStack className="gap-1">
            <Text className="text-3xl font-bold text-foreground">$725,000</Text>
            <Text className="text-base text-foreground-muted">89 Pacific Heights Blvd, San Francisco, CA 94115</Text>
          </VStack>

          <HStack className="gap-3">
            {[
              { label: "Beds", value: "4" },
              { label: "Baths", value: "3" },
              { label: "Sqft", value: "2,400" },
              { label: "Year", value: "1998" },
            ].map((s) => (
              <Card key={s.label}>
                <CardBody>
                  <VStack className="items-center gap-1 px-2">
                    <Text className="text-lg font-bold text-foreground">{s.value}</Text>
                    <Text className="text-xs text-foreground-muted">{s.label}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </HStack>

          <Divider />

          <Section title="Description">
            <Text className="text-sm text-foreground leading-relaxed">
              Stunning Pacific Heights home with panoramic bay views. This beautifully renovated
              4-bedroom residence features an open floor plan, chef's kitchen with marble countertops,
              hardwood floors throughout, and a private garden. Walking distance to Fillmore Street
              shops and restaurants. Two-car garage included.
            </Text>
          </Section>

          <Divider />

          <Section title="Listing Agent">
            <HStack className="gap-4 items-center">
              <Avatar name="Sarah Mitchell" size="lg" />
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">Sarah Mitchell</Text>
                <Text className="text-sm text-foreground-muted">Pacific Realty Group</Text>
              </VStack>
              <Button variant="secondary" size="sm">Contact Agent</Button>
            </HStack>
          </Section>

          <Button variant="primary" size="lg">Schedule Showing</Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
