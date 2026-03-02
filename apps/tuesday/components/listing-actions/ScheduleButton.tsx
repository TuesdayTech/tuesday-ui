import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ActivityIndicator,
  Alert,
  View,
  Text,
  TextInput,
} from "react-native";
import { CalendarCheck } from "phosphor-react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { useScheduleShowing } from "../../hooks/use-listing-actions";
import { useThemeColors } from "../../hooks/useThemeColors";
import { HIDDEN_SCHEDULE_STATUSES } from "../../types/listing-actions";

const DEV_MODE_KEY = "developerMode";
const DEV_PROFILE_UID_KEY = "developerProfileUID";

interface ScheduleButtonProps {
  listingUid: string;
  profileUid: string;
  standardStatus?: string;
  disabled?: boolean;
}

export function ScheduleButton({
  listingUid,
  profileUid,
  standardStatus,
  disabled,
}: ScheduleButtonProps) {
  const t = useThemeColors();
  const scheduleMutation = useScheduleShowing();
  const [isScheduling, setIsScheduling] = useState(false);

  // Developer mode state
  const devSheetRef = useRef<BottomSheetModal>(null);
  const [devProfileUid, setDevProfileUid] = useState("");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide for closed/expired/canceled/deleted listings
  if (
    standardStatus &&
    (HIDDEN_SCHEDULE_STATUSES as readonly string[]).includes(standardStatus)
  ) {
    return null;
  }

  const handlePress = useCallback(async () => {
    if (disabled || isScheduling) return;

    setIsScheduling(true);
    try {
      // Check for developer mode override
      let effectiveProfileUid = profileUid;
      try {
        const devMode = await AsyncStorage.getItem(DEV_MODE_KEY);
        if (devMode === "true") {
          const devUid = await AsyncStorage.getItem(DEV_PROFILE_UID_KEY);
          if (devUid?.trim()) effectiveProfileUid = devUid.trim();
        }
      } catch {
        // Dev mode read failed, use original profileUid
      }

      const result = await scheduleMutation.mutateAsync({
        profileUid: effectiveProfileUid,
        listingUid,
      });

      if (result.showing && result.URL) {
        await WebBrowser.openBrowserAsync(result.URL);
      } else {
        Alert.alert(
          "ShowingTime Error",
          "ShowingTime is not enabled for this listing",
          [{ text: "OK" }],
        );
      }
    } catch {
      Alert.alert(
        "ShowingTime Error",
        "ShowingTime is not enabled for this listing",
        [{ text: "OK" }],
      );
    } finally {
      setIsScheduling(false);
    }
  }, [disabled, isScheduling, scheduleMutation, profileUid, listingUid]);

  // Long press opens developer mode (if enabled)
  const handleLongPress = useCallback(async () => {
    try {
      const devMode = await AsyncStorage.getItem(DEV_MODE_KEY);
      if (devMode === "true") {
        const savedUid = await AsyncStorage.getItem(DEV_PROFILE_UID_KEY);
        setDevProfileUid(savedUid ?? "");
        devSheetRef.current?.present();
      }
    } catch {
      // Developer mode not available
    }
  }, []);

  const handleDevSave = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DEV_PROFILE_UID_KEY, devProfileUid.trim());
      devSheetRef.current?.dismiss();
    } catch {
      Alert.alert("Error", "Failed to save");
    }
  }, [devProfileUid]);

  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled || isScheduling}
        hitSlop={6}
        style={{
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isScheduling ? (
          <ActivityIndicator size="small" color={t.foreground} />
        ) : (
          <CalendarCheck size={24} color={t.foreground} weight="bold" />
        )}
      </Pressable>

      {/* Developer Mode Sheet */}
      <BottomSheetModal
        ref={devSheetRef}
        snapPoints={[250]}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: t.background, borderRadius: 20 }}
        handleIndicatorStyle={{ backgroundColor: t.foregroundMuted }}
      >
        <BottomSheetView
          style={{ paddingHorizontal: 20, paddingTop: 8, gap: 16 }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 22,
              color: t.foreground,
            }}
          >
            Developer Mode
          </Text>

          <TextInput
            value={devProfileUid}
            onChangeText={setDevProfileUid}
            placeholder="Profile UID"
            placeholderTextColor={t.foregroundMuted}
            keyboardType="number-pad"
            style={{
              fontFamily: "GeistSans",
              fontSize: 16,
              color: t.foreground,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => devSheetRef.current?.dismiss()}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                backgroundColor: t.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 16,
                  color: t.foreground,
                }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDevSave}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                backgroundColor: "#0A84FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "GeistSans-Medium",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
