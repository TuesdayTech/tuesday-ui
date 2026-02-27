import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAuth } from "../../../providers/auth-provider";
import { useProfile, useUpdateProfileMutation } from "../../../hooks/use-profile";
import { ProfileAvatar } from "../../../components/profile/ProfileAvatar";

export default function EditProfileScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { profile: authProfile, setAuth } = useAuth();
  const uid = authProfile?.UID ?? "";
  const { data: profile } = useProfile(uid);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setName(profile.MemberFullName ?? "");
      setPhone(profile.MemberMobilePhone ? String(profile.MemberMobilePhone) : "");
      setEmail(profile.MemberEmail ?? "");
    }
  }, [profile]);

  const updateMutation = useUpdateProfileMutation();

  const hasChanges =
    name !== (profile?.MemberFullName ?? "") ||
    phone !== (profile?.MemberMobilePhone ? String(profile.MemberMobilePhone) : "") ||
    email !== (profile?.MemberEmail ?? "");

  const canSave = hasChanges && name.trim().length > 0 && !updateMutation.isPending;

  const handleSave = async () => {
    if (!canSave || !uid) return;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    try {
      const updated = await updateMutation.mutateAsync({
        profileUID: uid,
        MemberFullName: name.trim(),
        MemberFirstName: firstName,
        MemberLastName: lastName,
        MemberMobilePhone: phone ? Number(phone) : undefined,
        MemberEmail: email || undefined,
      });

      // Update auth profile
      const token = await (await import("../../../lib/api/token")).tokenStore.get();
      if (token && updated) {
        await setAuth(token, updated);
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const bioText = profile?.MemberBio ?? "";
  const linksCount = profile?.MemberSocialMedia?.length ?? 0;

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
          Edit Profile
        </Text>
        <Pressable onPress={handleSave} disabled={!canSave}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#0A84FF" />
          ) : (
            <Text
              style={{
                fontFamily: "GeistSans-SemiBold",
                fontSize: 16,
                color: canSave ? "#0A84FF" : t.foregroundSubtle,
              }}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Avatar Section */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <ProfileAvatar
            uri={profile?.Media}
            name={profile?.MemberFullName}
            size={80}
          />
          <Pressable style={{ marginTop: 8 }}>
            <Text
              style={{
                fontFamily: "GeistSans-Medium",
                fontSize: 14,
                color: "#0A84FF",
              }}
            >
              Edit avatar
            </Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Name */}
          <FormField label="Name" required>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                fontFamily: "GeistSans",
                fontSize: 16,
                color: t.foreground,
                flex: 1,
                padding: 0,
              }}
              placeholderTextColor={t.foregroundSubtle}
              placeholder="Full name"
              autoCorrect={false}
            />
          </FormField>

          {/* Phone */}
          <FormField label="Phone">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={{
                fontFamily: "GeistSans",
                fontSize: 16,
                color: t.foreground,
                flex: 1,
                padding: 0,
                opacity: 0.7,
              }}
              placeholderTextColor={t.foregroundSubtle}
              placeholder="Phone number"
              keyboardType="phone-pad"
              editable={false}
            />
          </FormField>

          {/* Email */}
          <FormField label="Email">
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{
                fontFamily: "GeistSans",
                fontSize: 16,
                color: t.foreground,
                flex: 1,
                padding: 0,
                opacity: 0.7,
              }}
              placeholderTextColor={t.foregroundSubtle}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={false}
            />
          </FormField>

          {/* Bio */}
          <Pressable onPress={() => router.push("/profile/edit-bio" as any)}>
            <FormField label="Bio" showChevron>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "GeistSans",
                  fontSize: 16,
                  color: bioText ? t.foreground : t.foregroundSubtle,
                  flex: 1,
                }}
              >
                {bioText || "Bio"}
              </Text>
            </FormField>
          </Pressable>

          {/* Links */}
          <Pressable onPress={() => router.push("/profile/edit-links" as any)}>
            <FormField label="Links" showChevron>
              <Text
                style={{
                  fontFamily: "GeistSans",
                  fontSize: 16,
                  color: t.foreground,
                  flex: 1,
                }}
              >
                {linksCount > 0 ? `${linksCount} links` : "Add links"}
              </Text>
            </FormField>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormField({
  label,
  required,
  showChevron,
  children,
}: {
  label: string;
  required?: boolean;
  showChevron?: boolean;
  children: React.ReactNode;
}) {
  const t = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: t.border,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "GeistSans-SemiBold",
          fontSize: 15,
          color: t.foreground,
          width: 100,
        }}
      >
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
      {showChevron && (
        <CaretRight size={16} color={t.foregroundSubtle} weight="bold" />
      )}
    </View>
  );
}
