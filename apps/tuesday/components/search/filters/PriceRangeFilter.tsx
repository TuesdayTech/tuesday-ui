import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { RangeInputRow } from "./RangeInputRow";

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (min?: number, max?: number) => void;
}

function formatPriceInput(value: number): string {
  return value.toLocaleString();
}

function parsePriceInput(text: string): number | undefined {
  const cleaned = text.replace(/[^0-9]/g, "");
  if (!cleaned) return undefined;
  return parseInt(cleaned, 10);
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  const t = useThemeColors();
  const [minText, setMinText] = useState(
    minPrice != null ? formatPriceInput(minPrice) : "",
  );
  const [maxText, setMaxText] = useState(
    maxPrice != null ? formatPriceInput(maxPrice) : "",
  );

  // Debounce changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const min = parsePriceInput(minText);
      const max = parsePriceInput(maxText);
      onChange(min, max);
    }, 500);
    return () => clearTimeout(timer);
  }, [minText, maxText]);

  const handleMinChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (!cleaned) {
      setMinText("");
      return;
    }
    setMinText(parseInt(cleaned, 10).toLocaleString());
  };

  const handleMaxChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (!cleaned) {
      setMaxText("");
      return;
    }
    setMaxText(parseInt(cleaned, 10).toLocaleString());
  };

  return (
    <View>
      <Text
        style={{
          color: t.foreground,
          fontFamily: "GeistSans-SemiBold",
          fontSize: 15,
          marginBottom: 10,
        }}
      >
        Price
      </Text>
      <RangeInputRow
        minValue={minText ? `$${minText}` : ""}
        maxValue={maxText ? `$${maxText}` : ""}
        onMinChange={(v) => handleMinChange(v.replace("$", ""))}
        onMaxChange={(v) => handleMaxChange(v.replace("$", ""))}
        minPlaceholder="NO MIN"
        maxPlaceholder="NO MAX"
        keyboardType="number-pad"
      />
    </View>
  );
}
