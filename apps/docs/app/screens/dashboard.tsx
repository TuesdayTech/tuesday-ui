import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Badge, Avatar, Divider,
} from "@tuesday-ui/ui";

function MetricCard({ label, value, change, positive }: {
  label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <Box className="bg-surface rounded-xl p-4 flex-1 min-w-[140px]">
      <VStack className="gap-2">
        <Text className="text-xs text-foreground-muted uppercase tracking-wide">{label}</Text>
        <Text className="text-2xl font-semibold text-foreground">{value}</Text>
        <Text className={`text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}>
          {change}
        </Text>
      </VStack>
    </Box>
  );
}

const activities = [
  { id: "1", action: "New listing added", detail: "123 Oak Avenue — $450,000", time: "2h ago", badge: "New" as const },
  { id: "2", action: "Offer received", detail: "88 Maple Street — $315,000", time: "5h ago", badge: "Pending" as const },
  { id: "3", action: "Property sold", detail: "5 Harbor View Dr — $1,200,000", time: "1d ago", badge: "Sold" as const },
  { id: "4", action: "Client inquiry", detail: "Sarah K. — Looking for 3BR downtown", time: "1d ago", badge: undefined },
];

export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-6">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back to docs</Button>
        </Link>

        <HStack className="items-center justify-between">
          <VStack className="gap-1">
            <Text className="text-3xl font-semibold text-foreground">Dashboard</Text>
            <Text className="text-sm text-foreground-muted">Welcome back, Alex</Text>
          </VStack>
          <Avatar initials="AR" size="md" />
        </HStack>

        {/* Metrics */}
        <Box className="flex-row flex-wrap gap-3">
          <MetricCard label="Active Listings" value="24" change="↑ 12% this month" positive />
          <MetricCard label="Total Revenue" value="$2.4M" change="↑ 8% vs last quarter" positive />
          <MetricCard label="Avg. Days on Market" value="18" change="↓ 3 days" positive />
          <MetricCard label="Pending Deals" value="7" change="↓ 2 from last week" positive={false} />
        </Box>

        {/* Chart Placeholder */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Monthly Sales</Text>
          <Box className="bg-surface rounded-xl p-6 items-center justify-center h-48">
            <VStack className="items-center gap-2">
              <Text className="text-3xl">📊</Text>
              <Text className="text-sm text-foreground-muted">Chart placeholder</Text>
              <Text className="text-xs text-foreground-muted">Integrate your preferred chart library</Text>
            </VStack>
          </Box>
        </VStack>

        {/* Recent Activity */}
        <VStack className="gap-3">
          <HStack className="items-center justify-between">
            <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Recent Activity</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </HStack>
          <Box className="bg-surface rounded-xl overflow-hidden">
            {activities.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 && <Divider />}
                <HStack className="items-center justify-between p-4">
                  <VStack className="gap-0.5 flex-1">
                    <HStack className="items-center gap-2">
                      <Text className="text-sm font-medium text-foreground">{item.action}</Text>
                      {item.badge && (
                        <Badge variant={item.badge === "Sold" ? "success" : item.badge === "Pending" ? "warning" : "info"}>
                          {item.badge}
                        </Badge>
                      )}
                    </HStack>
                    <Text className="text-xs text-foreground-muted">{item.detail}</Text>
                  </VStack>
                  <Text className="text-xs text-foreground-muted">{item.time}</Text>
                </HStack>
              </React.Fragment>
            ))}
          </Box>
        </VStack>

        {/* Quick Actions */}
        <VStack className="gap-3 pb-8">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Quick Actions</Text>
          <HStack className="flex-wrap gap-3">
            <Button variant="primary" size="sm">+ Add Listing</Button>
            <Button variant="outline" size="sm">Generate Report</Button>
            <Button variant="outline" size="sm">Schedule Showing</Button>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
