import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSearchContext } from "../../providers/search-provider";
import { useAuth } from "../../providers/auth-provider";
import { api } from "../../lib/api/client";
import { buildFiltersBody } from "../../lib/search/filters";

type FlowStep = "naming" | "feedConfirmation" | "addClient";

interface SaveSearchSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SaveSearchSheet({ visible, onDismiss }: SaveSearchSheetProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { state } = useSearchContext();

  const [step, setStep] = useState<FlowStep>("naming");
  const [searchName, setSearchName] = useState("");
  const [playlistUid, setPlaylistUid] = useState<string | null>(null);
  const [clientType, setClientType] = useState<"Seller" | "Buyer">("Buyer");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);

  // Auto-generate name from locations + filters
  const defaultName = useMemo(() => {
    const parts: string[] = [];
    state.selectedLocations.forEach((l) => parts.push(l.name));
    if (state.filters.minPrice || state.filters.maxPrice) {
      const min = state.filters.minPrice
        ? `$${(state.filters.minPrice / 1000).toFixed(0)}K`
        : "";
      const max = state.filters.maxPrice
        ? `$${(state.filters.maxPrice / 1000).toFixed(0)}K`
        : "";
      if (min && max) parts.push(`${min} - ${max}`);
      else if (min) parts.push(`${min}+`);
      else if (max) parts.push(`< ${max}`);
    }
    if (state.filters.minBedrooms) {
      parts.push(`${state.filters.minBedrooms}+ beds`);
    }
    return parts.join(", ") || "My Search";
  }, [state.selectedLocations, state.filters]);

  // Reset all state when sheet opens
  React.useEffect(() => {
    if (visible) {
      setStep("naming");
      setSearchName(defaultName);
      setPlaylistUid(null);
      setClientType("Buyer");
      setClientName("");
      setClientPhone("");
      setIsSaving(false);
      setPreviewPhotos([]);
    }
  }, [visible, defaultName]);

  const handleSaveSearch = useCallback(async () => {
    if (!searchName.trim() || !profile?.UID) return;
    setIsSaving(true);
    try {
      const result = await api.request<{ UID: string; listings?: string[] }>("playlists", {
        method: "POST",
        body: {
          profileUID: profile.UID,
          title: searchName.trim(),
          isPublic: false,
          type: "search",
          filters: {
            ...buildFiltersBody(state.filters),
            cityUID: state.selectedLocations
              .filter((l) => l.type === "city")
              .map((l) => l.uid),
            postalCodeUID: state.selectedLocations
              .filter((l) => l.type === "zip")
              .map((l) => l.uid),
            points: state.customBoundaryPoints.map((p) => ({
              lat: p.lat,
              lng: p.lng,
            })),
          },
        },
        requiresAuth: true,
        responseKey: null,
      });
      setPlaylistUid(result.UID);
      setPreviewPhotos(result.listings?.slice(0, 4) ?? []);
      setStep("feedConfirmation");
    } catch {
      Alert.alert("Error", "Failed to save search. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [searchName, profile, state]);

  const handleAddClient = useCallback(async () => {
    if (!clientName.trim() || !playlistUid || !profile?.UID) return;
    setIsSaving(true);
    try {
      await api.request("clients/playlistAdd", {
        method: "POST",
        body: {
          profileUID: profile.UID,
          playlistUid,
          name: clientName.trim(),
          phone: clientPhone.trim(),
          type: clientType,
        },
        requiresAuth: true,
      });
      onDismiss();
      Alert.alert("Success", "Search has been saved!");
    } catch {
      Alert.alert("Error", "Failed to add client.");
    } finally {
      setIsSaving(false);
    }
  }, [clientName, clientPhone, clientType, playlistUid, profile, onDismiss]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Backdrop */}
        <Pressable
          onPress={onDismiss}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: t.background,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {/* Handle */}
          <View
            style={{
              alignSelf: "center",
              width: 36,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: t.foregroundSubtle,
              marginTop: 10,
              marginBottom: 16,
            }}
          />

          <View style={{ paddingHorizontal: 20 }}>
            {/* Step 1: Naming */}
            {step === "naming" && (
              <View style={{ gap: 16 }}>
                <Text
                  style={{
                    color: t.foreground,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 20,
                  }}
                >
                  Save search
                </Text>
                <TextInput
                  value={searchName}
                  onChangeText={setSearchName}
                  placeholder="Name your search"
                  placeholderTextColor={t.foregroundSubtle}
                  autoFocus
                  style={{
                    height: 48,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#0A84FF",
                    backgroundColor: t.backgroundSecondary,
                    paddingHorizontal: 14,
                    color: t.foreground,
                    fontFamily: "GeistSans",
                    fontSize: 16,
                  }}
                />
                <Pressable
                  onPress={handleSaveSearch}
                  disabled={!searchName.trim() || isSaving}
                  style={{
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: "#0A84FF",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: !searchName.trim() || isSaving ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "GeistSans-SemiBold",
                      fontSize: 16,
                    }}
                  >
                    {isSaving ? "Saving..." : "Save search"}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Step 2: Feed Confirmation */}
            {step === "feedConfirmation" && (
              <View style={{ gap: 16 }}>
                <Text
                  style={{
                    color: t.foreground,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 20,
                    textAlign: "center",
                  }}
                >
                  Add this saved search to your feed?
                </Text>
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Your feed on Tuesday is made of saved searches. You can make
                  changes to it at any time.
                </Text>

                {/* Preview card */}
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(10, 132, 255, 0.7)",
                    overflow: "hidden",
                    backgroundColor: t.backgroundSecondary,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      height: 200,
                    }}
                  >
                    {previewPhotos.map((url, i) => (
                      <Image
                        key={i}
                        source={{ uri: url }}
                        style={{ width: "50%", height: 100 }}
                        contentFit="cover"
                      />
                    ))}
                    {previewPhotos.length === 0 && (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: t.backgroundTertiary,
                        }}
                      >
                        <Text
                          style={{
                            color: t.foregroundSubtle,
                            fontFamily: "GeistSans",
                            fontSize: 13,
                          }}
                        >
                          No preview available
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      color: t.foreground,
                      fontFamily: "GeistSans-SemiBold",
                      fontSize: 18,
                      textAlign: "center",
                      padding: 14,
                    }}
                    numberOfLines={2}
                  >
                    {searchName}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setStep("addClient")}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: t.backgroundSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: t.foreground,
                        fontFamily: "GeistSans-SemiBold",
                        fontSize: 15,
                      }}
                    >
                      No thanks
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setStep("addClient")}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: "#0A84FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "GeistSans-SemiBold",
                        fontSize: 15,
                      }}
                    >
                      Add to my feed
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Step 3: Add Client */}
            {step === "addClient" && (
              <View style={{ gap: 16 }}>
                <Text
                  style={{
                    color: t.foreground,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 20,
                  }}
                >
                  Add a client to this saved search
                </Text>
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans",
                    fontSize: 14,
                  }}
                >
                  When you add a client, these listings will always be
                  prioritized at the top of your feed.
                </Text>

                {/* Buyer / Seller toggle */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: t.backgroundSecondary,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: t.border,
                    padding: 3,
                  }}
                >
                  {(["Seller", "Buyer"] as const).map((type) => {
                    const isActive = clientType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setClientType(type)}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: isActive ? "#0A84FF" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: isActive ? "#FFFFFF" : t.foreground,
                            fontFamily: "GeistSans-Medium",
                            fontSize: 15,
                          }}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Client name"
                  placeholderTextColor={t.foregroundSubtle}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: t.border,
                    backgroundColor: t.backgroundSecondary,
                    paddingHorizontal: 14,
                    color: t.foreground,
                    fontFamily: "GeistSans",
                    fontSize: 16,
                  }}
                />

                <TextInput
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  placeholder="Phone number"
                  placeholderTextColor={t.foregroundSubtle}
                  keyboardType="phone-pad"
                  style={{
                    height: 48,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: t.border,
                    backgroundColor: t.backgroundSecondary,
                    paddingHorizontal: 14,
                    color: t.foreground,
                    fontFamily: "GeistSans",
                    fontSize: 16,
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => {
                      onDismiss();
                      Alert.alert("Success", "Search has been saved!");
                    }}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: t.backgroundSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: t.foreground,
                        fontFamily: "GeistSans-SemiBold",
                        fontSize: 15,
                      }}
                    >
                      Not now
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddClient}
                    disabled={!clientName.trim() || isSaving}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: "#0A84FF",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: !clientName.trim() || isSaving ? 0.5 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "GeistSans-SemiBold",
                        fontSize: 15,
                      }}
                    >
                      {isSaving ? "Adding..." : "Add client"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
