import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Card, CardBody, Badge, Section, ListItem, Header, Divider,
} from "@tuesday-ui/ui";

const marketStats = [
  { label: "Avg Price", value: "$685K", change: "+5%", up: true },
  { label: "Days on Market", value: "28", change: "-12%", up: false },
  { label: "Active Listings", value: "1,247", change: "+8%", up: true },
  { label: "Sold This Month", value: "342", change: "+3%", up: true },
];

const recentActivity = [
  { title: "$925,000 — Sold", subtitle: "2450 Marina Blvd, San Francisco", time: "2h ago" },
  { title: "$1,200,000 — Listed", subtitle: "180 Nob Hill Ave, San Francisco", time: "4h ago" },
  { title: "$450,000 — Pending", subtitle: "78 Mission District St, San Francisco", time: "6h ago" },
  { title: "$680,000 — Price Cut", subtitle: "320 Sunset Blvd, San Francisco", time: "1d ago" },
];

export default function MarketDashboard() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-xl mx-auto gap-6">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>

        <Header title="Market Insights" />

        <Box className="flex-row flex-wrap gap-3">
          {marketStats.map((s) => (
            <Box key={s.label} className="w-[48%]">
              <Card>
                <CardBody>
                  <VStack className="gap-1">
                    <Text className="text-xs text-foreground-muted">{s.label}</Text>
                    <Text className="text-2xl font-bold text-foreground">{s.value}</Text>
                    <Badge variant={s.up ? "success" : "error"}>{s.change}</Badge>
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          ))}
        </Box>

        <Divider />

        <Section title="Recent Activity">
          <VStack className="gap-0">
            {recentActivity.map((a, i) => (
              <React.Fragment key={i}>
                <ListItem
                  title={a.title}
                  subtitle={a.subtitle}
                  trailing={<Text className="text-xs text-foreground-muted">{a.time}</Text>}
                />
                {i < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </VStack>
        </Section>

        <Divider />

        <Section title="Quick Actions">
          <HStack className="gap-2 flex-wrap">
            <Button variant="primary" size="sm">Add Listing</Button>
            <Button variant="secondary" size="sm">Run CMA</Button>
            <Button variant="outline" size="sm">Export Report</Button>
            <Button variant="outline" size="sm">Share Insights</Button>
          </HStack>
        </Section>
      </VStack>
    </ScrollView>
  );
}
