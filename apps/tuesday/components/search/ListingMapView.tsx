import React, { useRef, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import MapView, {
  Marker,
  Polygon,
  type Region,
} from "react-native-maps";
import type { Listing } from "../../types/listing";
import type { MapBounds, Coordinate } from "../../types/search";
import { STATUS_COLORS } from "../../lib/search/constants";

interface ListingMapViewProps {
  listings: Listing[];
  initialRegion: Region;
  onRegionChange: (bounds: MapBounds) => void;
  onMarkerPress?: (listing: Listing) => void;
  areaBoundaries?: Array<{ latitude: number; longitude: number }[]>;
  customBoundaryPoints?: Coordinate[];
  mapRef?: React.RefObject<MapView | null>;
}

/** Parse listing lat/lng strings to numbers, filtering out invalid */
function listingToCoord(listing: Listing) {
  const lat = parseFloat(listing.Latitude ?? "");
  const lng = parseFloat(listing.Longitude ?? "");
  if (isNaN(lat) || isNaN(lng)) return null;
  return { latitude: lat, longitude: lng };
}

function getMarkerColor(status?: string): string {
  return STATUS_COLORS[status ?? ""] ?? "#666666";
}

export function ListingMapView({
  listings,
  initialRegion,
  onRegionChange,
  onMarkerPress,
  areaBoundaries,
  customBoundaryPoints,
  mapRef: externalRef,
}: ListingMapViewProps) {
  const internalRef = useRef<MapView>(null);
  const mapRef = externalRef ?? internalRef;
  const scheme = useColorScheme();

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      const bounds: MapBounds = {
        minLat: region.latitude - region.latitudeDelta / 2,
        maxLat: region.latitude + region.latitudeDelta / 2,
        minLng: region.longitude - region.longitudeDelta / 2,
        maxLng: region.longitude + region.longitudeDelta / 2,
      };
      onRegionChange(bounds);
    },
    [onRegionChange],
  );

  const customBoundaryLatLng = useMemo(
    () =>
      customBoundaryPoints?.map((p) => ({
        latitude: p.lat,
        longitude: p.lng,
      })) ?? [],
    [customBoundaryPoints],
  );

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      showsUserLocation
      showsCompass
      showsMyLocationButton={false}
      userInterfaceStyle={scheme === "dark" ? "dark" : "light"}
    >
      {/* Listing markers */}
      {listings.map((listing) => {
        const coord = listingToCoord(listing);
        if (!coord) return null;
        return (
          <Marker
            key={listing.UID ?? listing.id}
            coordinate={coord}
            pinColor={getMarkerColor(listing.StandardStatus)}
            onPress={() => onMarkerPress?.(listing)}
            tracksViewChanges={false}
          />
        );
      })}

      {/* Area boundary polygons (blue) */}
      {areaBoundaries
        ?.filter((polygon) => polygon.length >= 3)
        .map((polygon, idx) => (
          <Polygon
            key={`area-${idx}`}
            coordinates={polygon}
            strokeColor="rgba(10, 132, 255, 0.8)"
            fillColor="rgba(10, 132, 255, 0.1)"
            strokeWidth={2}
          />
        ))}

      {/* Custom boundary polygon (purple) */}
      {customBoundaryLatLng.length >= 3 && (
        <Polygon
          coordinates={customBoundaryLatLng}
          strokeColor="rgba(139, 92, 246, 0.8)"
          fillColor="rgba(139, 92, 246, 0.15)"
          strokeWidth={2}
        />
      )}
    </MapView>
  );
}
