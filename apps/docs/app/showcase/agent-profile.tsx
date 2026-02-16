import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Card, CardBody, Avatar, Badge, Section, Divider,
} from "@tuesday-ui/ui";

const stats = [
  { label: "Listings", value: "24" },
  { label: "Sold", value: "156" },
  { label: "Reviews", value: "4.9 ★" },
];

const activeListings = [
  { address: "89 Pacific Heights Blvd, SF", price: "$725,000", beds: 4 },
  { address: "2200 Broadway St, SF", price: "$1,100,000", beds: 5 },
  { address: "445 Hayes Valley Ave, SF", price: "$580,000", beds: 2 },
];

const reviews = [
  { author: "Mark & Julie T.", text: "Sarah helped us find our dream home in record time. Her knowledge of the SF market is unmatched!" },
  { author: "David L.", text: "Professional, responsive, and a great negotiator. Got us $30k under asking price." },
  { author: "Anna K.", text: "We've worked with Sarah on three transactions now. She's the best in the business." },
];

export default function AgentProfile() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-xl mx-auto gap-6">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>

        <VStack className="items-center gap-3">
          <Avatar name="Sarah Mitchell" size="xl" />
          <Text className="text-2xl font-bold text-foreground">Sarah Mitchell</Text>
          <Badge variant="warning">Top Producer</Badge>
          <Text className="text-sm text-foreground-muted">Pacific Realty Group · San Francisco</Text>
        </VStack>

        <HStack className="gap-3 justify-center">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardBody>
                <VStack className="items-center gap-1 px-4">
                  <Text className="text-xl font-bold text-foreground">{s.value}</Text>
                  <Text className="text-xs text-foreground-muted">{s.label}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </HStack>

        <Button variant="primary" size="lg">Follow</Button>

        <Divider />

        <Section title="Active Listings">
          <VStack className="gap-3">
            {activeListings.map((l) => (
              <Card key={l.address}>
                <CardBody>
                  <HStack className="justify-between items-center">
                    <VStack className="gap-1 flex-1">
                      <Text className="text-base font-semibold text-foreground">{l.price}</Text>
                      <Text className="text-sm text-foreground-muted">{l.address}</Text>
                    </VStack>
                    <Badge>{l.beds} bed</Badge>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Section>

        <Divider />

        <Section title="Reviews">
          <VStack className="gap-4">
            {reviews.map((r) => (
              <VStack key={r.author} className="gap-1">
                <Text className="text-sm text-foreground italic">"{r.text}"</Text>
                <Text className="text-xs text-foreground-muted">— {r.author}</Text>
              </VStack>
            ))}
          </VStack>
        </Section>
      </VStack>
    </ScrollView>
  );
}
