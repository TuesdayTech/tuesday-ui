import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAuth } from "../../../providers/auth-provider";
import { useProfile, useUpdateProfileMutation } from "../../../hooks/use-profile";

export default function EditBioScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { profile: authProfile, setAuth } = useAuth();
  const uid = authProfile?.UID ?? "";
  const { data: profile } = useProfile(uid);
  const inputRef = useRef<TextInput>(null);

  const [bio, setBio] = useState("");
  const updateMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (profile?.MemberBio) {
      setBio(profile.MemberBio);
    }
  }, [profile]);

  useEffect(() => {
    // Auto-focus
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const hasChanges = bio !== (profile?.MemberBio ?? "");

  const handleSave = async () => {
    if (!uid || !hasChanges) return;

    try {
      const updated = await updateMutation.mutateAsync({
        profileUID: uid,
        MemberBio: bio,
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
          Bio
        </Text>
        <Pressable onPress={handleSave} disabled={!hasChanges}>
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
              color: hasChanges ? "#0A84FF" : t.foregroundSubtle,
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>

      {/* Text Editor */}
      <TextInput
        ref={inputRef}
        value={bio}
        onChangeText={setBio}
        multiline
        style={{
          flex: 1,
          fontFamily: "GeistSans",
          fontSize: 16,
          color: t.foreground,
          paddingHorizontal: 16,
          paddingTop: 12,
          textAlignVertical: "top",
        }}
        placeholderTextColor={t.foregroundSubtle}
        placeholder="Write your bio..."
      />

      {/* Character count */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "flex-end",
        }}
      >
        <Text
          style={{
            fontFamily: "GeistSans",
            fontSize: 12,
            color: t.foregroundSubtle,
          }}
        >
          {bio.length} symbols
        </Text>
      </View>
    </SafeAreaView>
  );
}
