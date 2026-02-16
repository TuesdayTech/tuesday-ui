import React from "react";
import { ScrollView, View } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Avatar, Badge, Divider,
} from "@tuesday-ui/ui";

const notifications = [
  {
    id: 1,
    type: "follow",
    avatar: null,
    displayName: "Michael Ross",
    body: "**Michael Ross** started following you",
    time: "2m",
    isFollowing: false,
    listingPhoto: null,
  },
  {
    id: 2,
    type: "like",
    avatar: null,
    displayName: "Sarah Chen",
    body: "**Sarah Chen** liked your listing on 2847 Woodland Ave",
    time: "15m",
    isFollowing: null,
    listingPhoto: "#3B82F6",
  },
  {
    id: 3,
    type: "like",
    avatar: null,
    displayName: "James Wilson",
    body: "**James Wilson** and **2 others** liked your listing on 1520 Summit Ave",
    time: "1h",
    isFollowing: null,
    listingPhoto: "#8B5CF6",
  },
  {
    id: 4,
    type: "playlistListing",
    avatar: null,
    displayName: "Tuesday",
    body: "**3 new listings** match your saved search \"Minneapolis, $300K–$800K, 3+ beds\"",
    time: "2h",
    isFollowing: null,
    listingPhoto: null,
    isSystem: true,
  },
  {
    id: 5,
    type: "follow",
    avatar: null,
    displayName: "Emily Park",
    body: "**Emily Park** started following you",
    time: "3h",
    isFollowing: true,
    listingPhoto: null,
  },
  {
    id: 6,
    type: "share",
    avatar: null,
    displayName: "David Kim",
    body: "**David Kim** shared your listing on 4215 Lyndale Ave S",
    time: "5h",
    isFollowing: null,
    listingPhoto: "#10B981",
  },
  {
    id: 7,
    type: "playlistInvitation",
    avatar: null,
    displayName: "Anna Thompson",
    body: "**Anna Thompson** invited you to collaborate on \"Lake District Homes\"",
    time: "1d",
    isFollowing: null,
    listingPhoto: null,
  },
  {
    id: 8,
    type: "like",
    avatar: null,
    displayName: "Mark Johnson",
    body: "**Mark Johnson** liked your listing on 5601 Drew Ave S",
    time: "2d",
    isFollowing: null,
    listingPhoto: "#F59E0B",
  },
];

function renderBody(body: string) {
  // Simple bold rendering: **text** -> bold
  const parts = body.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} className="text-white font-semibold text-sm">{part}</Text>
    ) : (
      <Text key={i} className="text-white text-sm">{part}</Text>
    )
  );
}

export default function Inbox() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#0A0A0A" }} showsVerticalScrollIndicator={false}>
      <VStack className="py-4 gap-0">
        {/* Header */}
        <HStack className="px-3 pb-3 items-center">
          <Text className="text-white font-semibold text-lg">Inbox</Text>
        </HStack>

        {/* Notifications */}
        {notifications.map((n) => (
          <VStack key={n.id} className="px-3">
            <HStack className="py-2 gap-2 items-center" style={{ minHeight: 60 }}>
              {/* Avatar */}
              {n.isSystem ? (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 18 }}>📋</Text>
                </View>
              ) : (
                <Avatar name={n.displayName} size="md" />
              )}

              {/* Body + time */}
              <VStack className="flex-1 gap-0">
                <Text className="text-sm leading-relaxed">
                  {renderBody(n.body)}
                  {n.type === "follow" ? (
                    <Text className="text-neutral-500 text-sm">. {n.time}</Text>
                  ) : (
                    <Text className="text-neutral-500 text-sm"> {n.time}</Text>
                  )}
                </Text>
              </VStack>

              {/* Trailing */}
              {n.type === "follow" && n.isFollowing !== null && (
                <Button
                  variant={n.isFollowing ? "outline" : "primary"}
                  size="sm"
                >
                  {n.isFollowing ? "Following" : "Follow"}
                </Button>
              )}

              {n.listingPhoto && (
                <View style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: n.listingPhoto }} />
              )}

              {n.type === "playlistInvitation" && (
                <HStack className="gap-2">
                  <Button variant="outline" size="sm">Decline</Button>
                  <Button variant="primary" size="sm">Accept</Button>
                </HStack>
              )}
            </HStack>
            <Divider />
          </VStack>
        ))}

        {/* Back */}
        <View style={{ marginTop: 24, paddingHorizontal: 12 }}>
          <Link href="/showcase" asChild>
            <Button variant="ghost" size="sm">← Back to Showcase</Button>
          </Link>
        </View>
      </VStack>
    </ScrollView>
  );
}
