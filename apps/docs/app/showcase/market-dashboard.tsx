import React from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Card, CardBody, Badge, Divider, ListItem,
} from "@tuesday-ui/ui";

const marketStats = [
  { label: "Median Price", value: "$385K", change: "+4.2%", up: true },
  { label: "Avg DOM", value: "24", change: "-18%", up: false },
  { label: "Active Listings", value: "1,847", change: "+12%", up: true },
  { label: "Closed MTD", value: "423", change: "+7%", up: true },
];

const recentActivity = [
  { price: "$749,900", status: "Active", address: "2847 Woodland Ave, Minneapolis", time: "2h ago", color: "success" as const },
  { price: "$1,250,000", status: "Pending", address: "1520 Summit Ave, St Paul", time: "4h ago", color: "warning" as const },
  { price: "$425,000", status: "Closed", address: "4215 Lyndale Ave S #302, Minneapolis", time: "6h ago", color: "error" as const },
  { price: "$899,000", status: "Price Drop", address: "5601 Drew Ave S, Minneapolis", time: "1d ago", color: "error" as const },
  { price: "$575,000", status: "Active", address: "3201 Dupont Ave S, Minneapolis", time: "1d ago", color: "success" as const },
];

export default function MarketDashboard() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#0A0A0A" }} showsVerticalScrollIndicator={false}>
      <VStack className="px-3 py-4 gap-6">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>

        <Text className="text-white text-2xl font-bold">Market Insights</Text>
        <Text className="text-neutral-400 text-sm">Minneapolis–St Paul Metro · February 2026</Text>

        {/* Stats grid */}
        <Box className="flex-row flex-wrap gap-2">
          {marketStats.map((s) => (
            <Box key={s.label} style={{ width: "48%" }}>
              <VStack className="bg-neutral-900 rounded-xl p-4 gap-1">
                <Text className="text-neutral-500 text-xs">{s.label}</Text>
                <Text className="text-white text-2xl font-bold">{s.value}</Text>
                <Badge variant={s.up ? "success" : "error"}>{s.change}</Badge>
              </VStack>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Recent activity */}
        <VStack className="gap-3">
          <Text className="text-white font-semibold text-base">Recent Activity</Text>
          {recentActivity.map((a, i) => (
            <HStack key={i} className="gap-3 items-center py-1">
              <VStack className="flex-1 gap-0.5">
                <HStack className="gap-2 items-center">
                  <Text className="text-white font-bold text-sm">{a.price}</Text>
                  <Badge variant={a.color}>{a.status}</Badge>
                </HStack>
                <Text className="text-neutral-400 text-xs">{a.address}</Text>
              </VStack>
              <Text className="text-neutral-500 text-xs">{a.time}</Text>
            </HStack>
          ))}
        </VStack>

        <Divider />

        {/* Quick actions */}
        <VStack className="gap-3">
          <Text className="text-white font-semibold text-base">Quick Actions</Text>
          <HStack className="gap-2 flex-wrap">
            <Button variant="primary" size="sm">Add Listing</Button>
            <Button variant="outline" size="sm">Run CMA</Button>
            <Button variant="outline" size="sm">Export Report</Button>
            <Button variant="outline" size="sm">Share Insights</Button>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
