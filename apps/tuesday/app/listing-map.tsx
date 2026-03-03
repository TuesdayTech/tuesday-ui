import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { View, Pressable, useColorScheme } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import {
  CaretLeft,
  MapTrifold,
  Crosshair,
  Play,
  Stop,
} from "phosphor-react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { ListingMarker } from "../components/search/ListingMarker";
import type { Listing } from "../types/listing";

const INITIAL_ALTITUDE = 2400;
const FLYOVER_ALTITUDE = 500;
const FLYOVER_PITCH = 75;
const NORMAL_PITCH = 10;
const ROTATION_INTERVAL = 100;
const ROTATION_STEP = 0.5;

export default function ListingMapScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const params = useLocalSearchParams<{
    lat: string;
    lng: string;
    standardStatus: string;
    roundedPrice: string;
    address: string;
  }>();

  const lat = parseFloat(params.lat ?? "0");
  const lng = parseFloat(params.lng ?? "0");
  const coord = { latitude: lat, longitude: lng };

  // Build a minimal listing object for ListingMarker
  const markerListing = useMemo(
    () =>
      ({
        StandardStatus: params.standardStatus ?? "Active",
        RoundedPrice: params.roundedPrice ?? "",
      }) as Listing,
    [params.standardStatus, params.roundedPrice],
  );

  const mapRef = useRef<MapView>(null);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const headingRef = useRef(0);

  const [isHybrid, setIsHybrid] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Cleanup rotation on unmount
  useEffect(() => {
    return () => {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
        rotationRef.current = null;
      }
    };
  }, []);

  const centerOnProperty = useCallback(() => {
    mapRef.current?.animateCamera(
      {
        center: coord,
        pitch: NORMAL_PITCH,
        heading: 0,
        altitude: INITIAL_ALTITUDE,
        zoom: 15,
      },
      { duration: 500 },
    );
  }, [coord]);

  const stopAnimation = useCallback(() => {
    if (rotationRef.current) {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
    }
    setIsAnimating(false);
    headingRef.current = 0;

    mapRef.current?.animateCamera(
      {
        center: coord,
        pitch: NORMAL_PITCH,
        heading: 0,
        altitude: INITIAL_ALTITUDE,
        zoom: 15,
      },
      { duration: 300 },
    );
  }, [coord]);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    headingRef.current = 0;

    // Phase 1: Zoom in close with high pitch
    mapRef.current?.animateCamera(
      {
        center: coord,
        pitch: FLYOVER_PITCH,
        heading: 0,
        altitude: FLYOVER_ALTITUDE,
        zoom: 18,
      },
      { duration: 500 },
    );

    // Phase 2: Start continuous rotation after zoom-in
    setTimeout(() => {
      rotationRef.current = setInterval(() => {
        headingRef.current = (headingRef.current + ROTATION_STEP) % 360;
        mapRef.current?.animateCamera(
          {
            center: coord,
            pitch: FLYOVER_PITCH,
            heading: headingRef.current,
            altitude: FLYOVER_ALTITUDE,
            zoom: 18,
          },
          { duration: ROTATION_INTERVAL },
        );
      }, ROTATION_INTERVAL);
    }, 600);
  }, [coord]);

  const toggleAnimation = useCallback(() => {
    if (isAnimating) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }, [isAnimating, stopAnimation, startAnimation]);

  // Stop animation on any user gesture
  const handlePanDrag = useCallback(() => {
    if (isAnimating) {
      stopAnimation();
    }
  }, [isAnimating, stopAnimation]);

  const buttonStyle = {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialCamera={{
          center: coord,
          pitch: NORMAL_PITCH,
          heading: 0,
          altitude: INITIAL_ALTITUDE,
          zoom: 15,
        }}
        mapType={isHybrid ? "hybrid" : "standard"}
        userInterfaceStyle={scheme === "dark" ? "dark" : "light"}
        showsPointsOfInterest={false}
        showsTraffic={false}
        showsCompass={false}
        onPanDrag={handlePanDrag}
      >
        <Marker coordinate={coord} anchor={{ x: 0.5, y: 1 }}>
          <ListingMarker listing={markerListing} />
        </Marker>
      </MapView>

      {/* Back button */}
      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
        edges={["top"]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CaretLeft size={22} color="#FFFFFF" weight="bold" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Map controls */}
      <View
        style={{
          position: "absolute",
          left: 16,
          bottom: insets.bottom + 24,
          gap: 10,
          zIndex: 8,
        }}
      >
        {/* Map style toggle */}
        <Pressable
          style={buttonStyle}
          onPress={() => setIsHybrid((prev) => !prev)}
          hitSlop={8}
        >
          <MapTrifold
            size={20}
            color={isHybrid ? "#0A84FF" : t.foreground}
            weight="regular"
          />
        </Pressable>

        {/* Center on property */}
        <Pressable style={buttonStyle} onPress={centerOnProperty} hitSlop={8}>
          <Crosshair size={20} color={t.foreground} weight="regular" />
        </Pressable>

        {/* 3D flyover animation */}
        <Pressable style={buttonStyle} onPress={toggleAnimation} hitSlop={8}>
          {isAnimating ? (
            <Stop size={20} color="#0A84FF" weight="fill" />
          ) : (
            <Play size={20} color={t.foreground} weight="regular" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
