import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Polygon, Marker, type Region } from "react-native-maps";
import Svg, { Polyline } from "react-native-svg";
import {
  CaretLeft,
  ArrowCounterClockwise,
  ArrowClockwise,
  Trash,
  Check,
  PencilSimple,
} from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { Coordinate } from "../../types/search";

type BoundaryMode = "viewing" | "drawing" | "editing";

interface CustomBoundaryViewProps {
  initialPoints: Coordinate[];
  initialRegion: Region;
  onSave: (points: Coordinate[]) => void;
  onCancel: () => void;
}

/**
 * Douglas-Peucker line simplification.
 */
function simplifyPath(
  points: { x: number; y: number }[],
  tolerance: number,
): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0)
    return Math.sqrt(
      (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2,
    );
  const t =
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
    (len * len);
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

export function CustomBoundaryView({
  initialPoints,
  initialRegion,
  onSave,
  onCancel,
}: CustomBoundaryViewProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const mapRef = useRef<MapView>(null);

  const hasInitial = initialPoints.length >= 3;
  const [mode, setMode] = useState<BoundaryMode>(
    hasInitial ? "viewing" : "drawing",
  );
  const [points, setPoints] = useState<Coordinate[]>(initialPoints);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<Coordinate[][]>([]);
  const [redoStack, setRedoStack] = useState<Coordinate[][]>([]);

  // Full drawing path ref (all points, for simplification)
  const drawingPathRef = useRef<{ x: number; y: number }[]>([]);
  // SVG polyline points string — updated during drawing for live feedback
  const [svgPoints, setSvgPoints] = useState("");

  const pushUndo = useCallback(
    (currentPoints: Coordinate[]) => {
      setUndoStack((prev) => [...prev, currentPoints]);
      setRedoStack([]);
    },
    [],
  );

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [...r, points]);
      setPoints(last);
      return prev.slice(0, -1);
    });
  }, [points]);

  const handleRedo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUndoStack((u) => [...u, points]);
      setPoints(last);
      return prev.slice(0, -1);
    });
  }, [points]);

  const handleClear = useCallback(() => {
    pushUndo(points);
    setPoints([]);
    setMode("drawing");
  }, [points, pushUndo]);

  const handleDone = useCallback(() => {
    if (points.length >= 3) {
      onSave(points);
    }
  }, [points, onSave]);

  // Convert screen points to geo coordinates after drawing
  const finishDrawing = useCallback(async () => {
    const path = drawingPathRef.current;
    drawingPathRef.current = [];
    setSvgPoints("");
    setIsDrawing(false);

    if (path.length < 10) return;

    const simplified = simplifyPath(path, 12);
    if (simplified.length < 3) return;

    const coords: Coordinate[] = [];
    for (const pt of simplified) {
      try {
        const coord = await mapRef.current?.coordinateForPoint({
          x: pt.x,
          y: pt.y,
        });
        if (coord) {
          coords.push({ lat: coord.latitude, lng: coord.longitude });
        }
      } catch {
        // skip
      }
    }

    if (coords.length >= 3) {
      pushUndo(points);
      setPoints(coords);
      setMode("editing");
    }
  }, [points, pushUndo]);

  // PanResponder for drawing with live SVG feedback
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => mode === "drawing",
        onMoveShouldSetPanResponder: () => mode === "drawing",
        onPanResponderGrant: (evt) => {
          const { pageX, pageY } = evt.nativeEvent;
          drawingPathRef.current = [{ x: pageX, y: pageY }];
          setSvgPoints(`${pageX},${pageY}`);
          setIsDrawing(true);
        },
        onPanResponderMove: (evt) => {
          const { pageX, pageY } = evt.nativeEvent;
          drawingPathRef.current.push({ x: pageX, y: pageY });
          // Build SVG points string from full path
          setSvgPoints((prev) => `${prev} ${pageX},${pageY}`);
        },
        onPanResponderRelease: () => {
          finishDrawing();
        },
        onPanResponderTerminate: () => {
          drawingPathRef.current = [];
          setSvgPoints("");
          setIsDrawing(false);
        },
      }),
    [mode, finishDrawing],
  );

  const polygonCoords = useMemo(
    () => points.map((p) => ({ latitude: p.lat, longitude: p.lng })),
    [points],
  );

  const title =
    mode === "drawing"
      ? "Draw boundaries"
      : mode === "editing"
        ? "Edit boundaries"
        : "Boundaries";

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Toolbar */}
      <View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 20,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          height: 48,
        }}
      >
        <Pressable onPress={onCancel} hitSlop={8}>
          <CaretLeft size={22} color={t.foreground} weight="bold" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            color: t.foreground,
            fontFamily: "GeistSans-SemiBold",
            fontSize: 17,
          }}
        >
          {title}
        </Text>
        {mode === "editing" ? (
          <View className="flex-row" style={{ gap: 16 }}>
            <Pressable
              onPress={handleUndo}
              disabled={undoStack.length === 0}
              hitSlop={8}
            >
              <ArrowCounterClockwise
                size={20}
                color={
                  undoStack.length === 0 ? t.foregroundSubtle : t.foreground
                }
                weight="bold"
              />
            </Pressable>
            <Pressable
              onPress={handleRedo}
              disabled={redoStack.length === 0}
              hitSlop={8}
            >
              <ArrowClockwise
                size={20}
                color={
                  redoStack.length === 0 ? t.foregroundSubtle : t.foreground
                }
                weight="bold"
              />
            </Pressable>
          </View>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        scrollEnabled={mode !== "drawing"}
        zoomEnabled={mode !== "drawing"}
        rotateEnabled={mode !== "drawing"}
        pitchEnabled={false}
        showsUserLocation
        userInterfaceStyle={scheme === "dark" ? "dark" : "light"}
      >
        {points.length >= 3 && (
          <Polygon
            coordinates={polygonCoords}
            strokeColor="rgba(139, 92, 246, 0.8)"
            fillColor="rgba(139, 92, 246, 0.2)"
            strokeWidth={2}
          />
        )}

        {mode === "editing" &&
          points.map((pt, idx) => (
            <Marker
              key={`pt-${idx}`}
              coordinate={{ latitude: pt.lat, longitude: pt.lng }}
              draggable
              onDragEnd={(e) => {
                pushUndo(points);
                setPoints((prev) => {
                  const next = [...prev];
                  next[idx] = {
                    lat: e.nativeEvent.coordinate.latitude,
                    lng: e.nativeEvent.coordinate.longitude,
                  };
                  return next;
                });
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 3,
                  borderColor: "#8B5CF6",
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                }}
              />
            </Marker>
          ))}
      </MapView>

      {/* Drawing touch overlay + live SVG path */}
      {mode === "drawing" && (
        <View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
          pointerEvents="box-only"
        >
          {/* Live drawing stroke */}
          {isDrawing && svgPoints.length > 0 && (
            <Svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              pointerEvents="none"
            >
              <Polyline
                points={svgPoints}
                fill="none"
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>
      )}

      {/* Bottom action buttons */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 20,
          zIndex: 20,
          gap: 12,
        }}
      >
        {mode === "viewing" && (
          <Pressable
            onPress={() => setMode("drawing")}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#8B5CF6",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <PencilSimple size={22} color="#FFFFFF" weight="bold" />
          </Pressable>
        )}

        {(mode === "editing" ||
          (mode === "drawing" && points.length >= 3)) && (
          <>
            <Pressable
              onPress={handleClear}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: t.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: t.border,
              }}
            >
              <Trash size={22} color={t.foreground} weight="regular" />
            </Pressable>
            <Pressable
              onPress={handleDone}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#8B5CF6",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Check size={22} color="#FFFFFF" weight="bold" />
            </Pressable>
          </>
        )}
      </View>

      {/* Drawing hint */}
      {mode === "drawing" && points.length === 0 && !isDrawing && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 90,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor:
                scheme === "dark"
                  ? "rgba(30,30,30,0.9)"
                  : "rgba(255,255,255,0.9)",
            }}
          >
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-Medium",
                fontSize: 14,
              }}
            >
              Draw a boundary on the map
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
