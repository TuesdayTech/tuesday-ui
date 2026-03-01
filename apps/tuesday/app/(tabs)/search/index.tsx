import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MapView, { type Region } from "react-native-maps";
import * as Location from "expo-location";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useSearchContext } from "../../../providers/search-provider";
import { useMapSearch } from "../../../hooks/use-map-search";
import { useAuth } from "../../../providers/auth-provider";
import { ListingMapView } from "../../../components/search/ListingMapView";
import { MapControls } from "../../../components/search/MapControls";
import { MapSearchBar } from "../../../components/search/MapSearchBar";
import { SearchOverlay } from "../../../components/search/SearchOverlay";
import { FilterPills } from "../../../components/search/FilterPills";
import { SearchBottomBar } from "../../../components/search/SearchBottomBar";
import { ListingGridView } from "../../../components/search/ListingGridView";
import { CustomBoundaryView } from "../../../components/search/CustomBoundaryView";
import { SaveSearchSheet } from "../../../components/search/SaveSearchSheet";
import { useAllAreaBoundaries } from "../../../hooks/use-area-boundaries";
import { getMlsType, MLS_COORDINATES, DEFAULT_REGION } from "../../../lib/search/constants";
import type { MapBounds, Coordinate } from "../../../types/search";

export default function SearchScreen() {
  return <SearchScreenContent />;
}

function SearchScreenContent() {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { state, dispatch } = useSearchContext();
  const { searchByBox, searchImmediate } = useMapSearch();
  const mapRef = useRef<MapView>(null);

  const [isHybrid, setIsHybrid] = useState(false);
  const [showBoundaryDrawer, setShowBoundaryDrawer] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const boundsRef = useRef<MapBounds | null>(null);
  const currentRegionRef = useRef<Region | null>(null);

  // Compute initial region from MLS
  const mlsType = getMlsType(profile?.UID);
  const mlsCoord = MLS_COORDINATES[mlsType] ?? DEFAULT_REGION;
  const initialRegion = useMemo(
    () => ({
      latitude: mlsCoord.lat,
      longitude: mlsCoord.lng,
      latitudeDelta: mlsCoord.latDelta,
      longitudeDelta: mlsCoord.lngDelta,
    }),
    [mlsCoord],
  );

  // Auto-load listings on tab entry (matching SwiftUI flow):
  // 1. Show MLS fallback immediately + search listings
  // 2. If location permission already granted → get GPS + move map
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadInitial = async () => {
      // Step 1: Search with MLS fallback bounds immediately
      const fallbackBounds: MapBounds = {
        minLat: initialRegion.latitude - initialRegion.latitudeDelta / 2,
        maxLat: initialRegion.latitude + initialRegion.latitudeDelta / 2,
        minLng: initialRegion.longitude - initialRegion.longitudeDelta / 2,
        maxLng: initialRegion.longitude + initialRegion.longitudeDelta / 2,
      };
      boundsRef.current = fallbackBounds;
      dispatch({ type: "SET_MAP_BOUNDS", bounds: fallbackBounds });
      searchImmediate(fallbackBounds);

      // Step 2: Check if location permission is already granted (don't request)
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        const delta = 0.09; // ~10km radius matching SwiftUI distance: 10000

        // Animate map to user location
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
          300,
        );

        // Re-search with user location bounds
        const userBounds: MapBounds = {
          minLat: latitude - delta / 2,
          maxLat: latitude + delta / 2,
          minLng: longitude - delta / 2,
          maxLng: longitude + delta / 2,
        };
        boundsRef.current = userBounds;
        dispatch({ type: "SET_MAP_BOUNDS", bounds: userBounds });
        searchImmediate(userBounds);
      } catch {
        // Location unavailable — keep using MLS fallback
      }
    };

    const timer = setTimeout(loadInitial, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch area boundaries for ALL selected locations
  const allLocationUids = useMemo(
    () => state.selectedLocations.map((l) => l.uid),
    [state.selectedLocations],
  );
  const areaBoundaries = useAllAreaBoundaries(allLocationUids);

  // Fit map to show ALL territories whenever boundary data or custom boundary changes
  const prevTerritoryRef = useRef({ areas: 0, custom: false });
  useEffect(() => {
    const hasCustom = state.customBoundaryPoints.length >= 3;
    const prev = prevTerritoryRef.current;

    // Only refit when the actual data set changes
    if (areaBoundaries.length === prev.areas && hasCustom === prev.custom) return;
    prevTerritoryRef.current = { areas: areaBoundaries.length, custom: hasCustom };

    // Nothing to show
    if (areaBoundaries.length === 0 && !hasCustom) return;

    // Collect all coordinates from all sources
    const allCoords: { latitude: number; longitude: number }[] = [];
    for (const polygon of areaBoundaries) {
      allCoords.push(...polygon);
    }
    if (hasCustom) {
      for (const pt of state.customBoundaryPoints) {
        allCoords.push({ latitude: pt.lat, longitude: pt.lng });
      }
    }

    if (allCoords.length >= 2) {
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: { top: 120, right: 40, bottom: 200, left: 40 },
        animated: true,
      });
    }
  }, [areaBoundaries, state.customBoundaryPoints]);

  // Handle map region changes
  const handleRegionChange = useCallback(
    (bounds: MapBounds) => {
      boundsRef.current = bounds;
      // Store as Region for boundary drawer
      currentRegionRef.current = {
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitudeDelta: bounds.maxLat - bounds.minLat,
        longitudeDelta: bounds.maxLng - bounds.minLng,
      };
      dispatch({ type: "SET_MAP_BOUNDS", bounds });
      searchByBox(bounds);
    },
    [dispatch, searchByBox],
  );

  // Re-search when filters or locations change
  useEffect(() => {
    if (boundsRef.current) {
      searchImmediate(boundsRef.current);
    }
  }, [state.filters, state.selectedLocations, state.customBoundaryPoints, searchImmediate]);

  // Map controls
  const handleToggleMapType = useCallback(() => {
    setIsHybrid((prev) => !prev);
  }, []);

  const handleCenterUserLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, []);

  // Boundary callbacks
  const handleBoundarySave = useCallback(
    (points: Coordinate[]) => {
      dispatch({ type: "SET_CUSTOM_BOUNDARY", points });
      setShowBoundaryDrawer(false);
    },
    [dispatch],
  );

  const handleBoundaryCancel = useCallback(() => {
    setShowBoundaryDrawer(false);
  }, []);

  // Listing press (grid/map)
  const handleListingPress = useCallback(
    (listing: { UID?: string }) => {
      if (listing.UID) {
        router.push(`/listing/${listing.UID}`);
      }
    },
    [router],
  );

  const isMap = state.viewMode === "map";

  // Full-screen boundary drawer takes over the screen
  if (showBoundaryDrawer) {
    return (
      <CustomBoundaryView
        initialPoints={state.customBoundaryPoints}
        initialRegion={currentRegionRef.current ?? initialRegion}
        onSave={handleBoundarySave}
        onCancel={handleBoundaryCancel}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Map layer */}
      {isMap && (
        <ListingMapView
          listings={state.listings}
          initialRegion={initialRegion}
          onRegionChange={handleRegionChange}
          onMarkerPress={handleListingPress}
          areaBoundaries={areaBoundaries.length > 0 ? areaBoundaries : undefined}
          customBoundaryPoints={state.customBoundaryPoints}
          mapRef={mapRef}
        />
      )}

      {/* Grid view layer */}
      {!isMap && (
        <ListingGridView
          listings={state.listings}
          topInset={insets.top + 100}
          onListingPress={handleListingPress}
        />
      )}

      {/* Search overlay (blurred background when search is focused) */}
      {state.isSearchFocused && (
        <SearchOverlay onCenterLocation={handleCenterUserLocation} />
      )}

      {/* Top search bar */}
      <MapSearchBar />

      {/* Filter pills — below search bar, only when filters active and not searching */}
      {!state.isSearchFocused && <FilterPills />}

      {/* Map controls */}
      {isMap && !state.isSearchFocused && (
        <MapControls
          onToggleMapType={handleToggleMapType}
          onCenterUserLocation={handleCenterUserLocation}
          onDrawBoundary={() => setShowBoundaryDrawer(true)}
          isHybrid={isHybrid}
        />
      )}

      {/* Bottom action bar */}
      {!state.isSearchFocused && (
        <SearchBottomBar
          onSaveSearch={() => setShowSaveSheet(true)}
        />
      )}

      {/* Loading indicator */}
      {state.isLoading && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 110,
            alignSelf: "center",
          }}
        >
          <ActivityIndicator size="small" color={t.foregroundMuted} />
        </View>
      )}

      {/* Save search bottom sheet */}
      <SaveSearchSheet
        visible={showSaveSheet}
        onDismiss={() => setShowSaveSheet(false)}
      />


    </View>
  );
}
