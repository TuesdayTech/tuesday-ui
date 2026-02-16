import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';
import { ThemeContext, type ThemeMode, type ResolvedTheme } from '@tuesday-ui/hooks';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'dark' }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const resolved: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return mode;
  }, [mode, systemScheme]);

  const isDark = resolved === 'dark';

  const contextValue = useMemo(
    () => ({ mode, resolved, setMode, isDark }),
    [mode, resolved, isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
