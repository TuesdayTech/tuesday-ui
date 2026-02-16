import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Avatar, Divider, Badge, Card,
} from "@tuesday-ui/ui";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <VStack className="items-center flex-1 py-3">
      <Text className="text-2xl font-semibold text-foreground">{value}</Text>
      <Text className="text-xs text-foreground-muted">{label}</Text>
    </VStack>
  );
}

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-lg mx-auto gap-6">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back to docs</Button>
        </Link>

        {/* Profile Header */}
        <VStack className="items-center gap-4 pt-4">
          <Avatar initials="JD" size="lg" />
          <VStack className="items-center gap-1">
            <HStack className="items-center gap-2">
              <Text className="text-2xl font-semibold text-foreground">Jane Doe</Text>
              <Badge variant="success">Verified</Badge>
            </HStack>
            <Text className="text-sm text-foreground-muted">Senior Real Estate Agent</Text>
            <Text className="text-sm text-foreground-muted">Downtown Office • Since 2019</Text>
          </VStack>
          <HStack className="gap-3">
            <Button variant="primary" size="sm">Edit Profile</Button>
            <Button variant="outline" size="sm">Share</Button>
          </HStack>
        </VStack>

        {/* Stats */}
        <Box className="bg-surface rounded-xl">
          <HStack>
            <StatCard label="Listings" value="24" />
            <StatCard label="Sold" value="87" />
            <StatCard label="Reviews" value="4.9★" />
          </HStack>
        </Box>

        {/* About */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">About</Text>
          <Box className="bg-surface rounded-xl p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              Specializing in luxury residential properties in the downtown area.
              Over 5 years of experience helping families find their dream homes.
              Licensed in residential and commercial real estate.
            </Text>
          </Box>
        </VStack>

        {/* Contact */}
        <VStack className="gap-3">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Contact</Text>
          <Box className="bg-surface rounded-xl overflow-hidden">
            <HStack className="items-center justify-between p-4">
              <Text className="text-sm text-foreground-muted">Phone</Text>
              <Text className="text-sm text-foreground">+1 (555) 123-4567</Text>
            </HStack>
            <Divider />
            <HStack className="items-center justify-between p-4">
              <Text className="text-sm text-foreground-muted">Email</Text>
              <Text className="text-sm text-foreground">jane@realty.co</Text>
            </HStack>
            <Divider />
            <HStack className="items-center justify-between p-4">
              <Text className="text-sm text-foreground-muted">License</Text>
              <Text className="text-sm text-foreground">#RE-2019-0042</Text>
            </HStack>
          </Box>
        </VStack>

        {/* Recent Sales */}
        <VStack className="gap-3 pb-8">
          <Text className="text-sm font-medium text-foreground-muted uppercase tracking-wide">Recent Sales</Text>
          {[
            { address: "123 Oak Avenue", price: "$450,000", date: "Jan 2026" },
            { address: "88 Maple Street", price: "$320,000", date: "Dec 2025" },
            { address: "5 Harbor View Dr", price: "$1,200,000", date: "Nov 2025" },
          ].map((sale) => (
            <Box key={sale.address} className="bg-surface rounded-xl p-4">
              <HStack className="items-center justify-between">
                <VStack className="gap-0.5">
                  <Text className="text-sm font-medium text-foreground">{sale.address}</Text>
                  <Text className="text-xs text-foreground-muted">{sale.date}</Text>
                </VStack>
                <Text className="text-sm font-semibold text-foreground">{sale.price}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
