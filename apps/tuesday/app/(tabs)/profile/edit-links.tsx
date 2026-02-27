import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CaretLeft, PlusCircle, XCircle } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAuth } from "../../../providers/auth-provider";
import { useProfile, useUpdateProfileMutation } from "../../../hooks/use-profile";

export default function EditLinksScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { profile: authProfile, setAuth } = useAuth();
  const uid = authProfile?.UID ?? "";
  const { data: profile } = useProfile(uid);

  const [links, setLinks] = useState<string[]>([]);
  const updateMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (profile?.MemberSocialMedia) {
      setLinks([...profile.MemberSocialMedia]);
    }
  }, [profile]);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const handleSave = async () => {
    if (!uid) return;

    // Remove empty links
    const cleanedLinks = links.filter((l) => l.trim().length > 0);

    try {
      const updated = await updateMutation.mutateAsync({
        profileUID: uid,
        MemberSocialMedia: cleanedLinks,
      });

      const token = await (await import("../../../lib/api/token")).tokenStore.get();
      if (token && updated) {
        await setAuth(token, updated);
      }

      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      {/* Nav Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <CaretLeft size={22} color={t.foreground} weight="bold" />
        </Pressable>
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 18,
            color: t.foreground,
          }}
        >
          Links
        </Text>
        <Pressable onPress={handleSave}>
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
              color: "#0A84FF",
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {links.map((link, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 8,
              borderBottomWidth: 0.5,
              borderBottomColor: t.border,
            }}
          >
            <TextInput
              value={link}
              onChangeText={(val) => updateLink(index, val)}
              style={{
                flex: 1,
                fontFamily: "GeistSans",
                fontSize: 16,
                color: t.foreground,
                padding: 0,
              }}
              placeholderTextColor={t.foregroundSubtle}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable hitSlop={8} onPress={() => removeLink(index)}>
              <XCircle size={20} color={t.foregroundSubtle} weight="fill" />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={addLink}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
          }}
        >
          <PlusCircle size={22} color="#0A84FF" weight="fill" />
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 16,
              color: "#0A84FF",
            }}
          >
            Add link
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
