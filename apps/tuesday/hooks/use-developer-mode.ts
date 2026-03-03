import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_MODE_KEY = "developerMode";
const MLS_TYPE_KEY = "selectedMLSType";

export type MLSType = "All" | "Northstar" | "RealMLS" | "CRMLS" | "MIBOR";

export const MLS_TYPES: MLSType[] = ["All", "Northstar", "RealMLS", "CRMLS", "MIBOR"];

export function useDeveloperMode() {
  const [enabled, setEnabled] = useState(false);
  const [selectedMLS, setSelectedMLS] = useState<MLSType>("All");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(DEV_MODE_KEY),
      AsyncStorage.getItem(MLS_TYPE_KEY),
    ]).then(([devMode, mlsType]) => {
      if (devMode === "true") setEnabled(true);
      if (mlsType && MLS_TYPES.includes(mlsType as MLSType)) {
        setSelectedMLS(mlsType as MLSType);
      }
      setIsLoaded(true);
    });
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(DEV_MODE_KEY, String(next));
  }, [enabled]);

  const setMLS = useCallback(async (type: MLSType) => {
    setSelectedMLS(type);
    await AsyncStorage.setItem(MLS_TYPE_KEY, type);
  }, []);

  const reset = useCallback(async () => {
    setEnabled(false);
    setSelectedMLS("All");
    await AsyncStorage.multiRemove([DEV_MODE_KEY, MLS_TYPE_KEY]);
  }, []);

  return { enabled, selectedMLS, isLoaded, toggle, setMLS, reset };
}
