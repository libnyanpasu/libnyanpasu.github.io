import { isEqual, kebabCase } from "lodash-es";
import { useLocalStorage } from "usehooks-ts";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
} from "@material/material-color-utilities";
import { alpha, darken, lighten } from "@/lib/color";
import { isBrowser } from "@/consts";
import { insertStyle } from "@/lib/styled";

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

type ResolvedThemeMode = ThemeMode.LIGHT | ThemeMode.DARK;

export const DEFAULT_COLOR = "#1867C0";

const CUSTOM_THEME_KEY = "custom-theme" as const;
const THEME_PALETTE_KEY = "theme-palette-v1" as const;
const THEME_CSS_VARS_KEY = "theme-css-vars-v1" as const;

const generateThemeCssVars = ({ schemes }: Theme) => {
  let lightCssVars = ":root{";
  let darkCssVars = ":root.dark{";

  for (const [mode, scheme] of Object.entries(schemes)) {
    const inputScheme =
      typeof (scheme as any).toJSON === "function" ? (scheme as any).toJSON() : scheme;

    for (const [key, value] of Object.entries(inputScheme)) {
      const prop = `--color-md-${kebabCase(key)}:${hexFromArgb(value as number)};`;
      if (mode === "light") {
        lightCssVars += prop;
      } else {
        darkCssVars += prop;
      }
    }
  }

  lightCssVars += "}";
  darkCssVars += "}";
  return lightCssVars + darkCssVars;
};

const STORAGE_THEME_MODE = "nyanpasu-theme-mode";
const STORAGE_THEME_COLOR = "nyanpasu-theme-color";
const STARLIGHT_THEME_STORAGE_KEY = "starlight-theme";

const getSystemThemeMode = (): ResolvedThemeMode =>
  isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;

const changeHtmlThemeMode = (mode: ResolvedThemeMode) => {
  if (!isBrowser) {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", mode === ThemeMode.DARK);
  root.classList.toggle("light", mode === ThemeMode.LIGHT);
};

const toStarlightTheme = (mode: ThemeMode) =>
  mode === ThemeMode.LIGHT || mode === ThemeMode.DARK ? mode : "auto";

declare global {
  interface Window {
    StarlightThemeProvider?: {
      updatePickers: (theme?: "auto" | "dark" | "light") => void;
    };
  }
}

const getThemeScheme = (theme: Theme, mode: ResolvedThemeMode) => {
  const scheme = theme.schemes[mode];
  return typeof (scheme as any).toJSON === "function" ? (scheme as any).toJSON() : scheme;
};

const applyRootStyleVar = (mode: ResolvedThemeMode, themePalette: Theme) => {
  if (!isBrowser) {
    return;
  }

  const root = document.documentElement;
  const scheme = getThemeScheme(themePalette, mode);
  const secondaryColor = hexFromArgb(scheme.secondary);
  const primaryColor = hexFromArgb(scheme.primary);
  const isDarkMode = mode === ThemeMode.DARK;

  root.style.setProperty(
    "--background-color",
    isDarkMode ? darken(secondaryColor, 0.95) : lighten(secondaryColor, 0.95),
  );
  root.style.setProperty("--selection-color", isDarkMode ? "#d5d5d5" : "#f5f5f5");
  root.style.setProperty("--scroller-color", isDarkMode ? "#54545480" : "#90939980");
  root.style.setProperty("--primary-main", primaryColor);
  root.style.setProperty("--background-color-alpha", alpha(primaryColor, 0.1));
};

interface ThemeContextValue {
  themePalette: Theme;
  themeCssVars: string;
  themeColor: string;
  setThemeColor: (color: string) => Promise<void>;
  themeMode: ThemeMode;
  currentThemeMode: ResolvedThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const noopAsync = async () => {};

const defaultContextValue: ThemeContextValue = {
  themePalette: themeFromSourceColor(argbFromHex(DEFAULT_COLOR)),
  themeCssVars: "",
  themeColor: DEFAULT_COLOR,
  setThemeColor: noopAsync,
  themeMode: ThemeMode.SYSTEM,
  currentThemeMode: ThemeMode.LIGHT,
  setThemeMode: noopAsync,
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Persistent user preferences
  const [themeModeSetting, setThemeModeSetting] = useLocalStorage<ThemeMode>(
    STORAGE_THEME_MODE,
    ThemeMode.SYSTEM,
  );
  const [themeColorSetting, setThemeColorSetting] = useLocalStorage<string>(
    STORAGE_THEME_COLOR,
    DEFAULT_COLOR,
  );

  // Resolved theme (auto -> system preference)
  const [resolvedThemeMode, setResolvedThemeMode] = useState<ResolvedThemeMode>(
    isBrowser ? getSystemThemeMode() : ThemeMode.LIGHT,
  );

  // Material theme palette (cached)
  const [cachedThemePalette, setCachedThemePalette] = useLocalStorage<Theme>(
    THEME_PALETTE_KEY,
    themeFromSourceColor(argbFromHex(themeColorSetting || DEFAULT_COLOR)),
  );

  // CSS vars string (cached)
  const [cachedThemeCssVars, setCachedThemeCssVars] = useLocalStorage<string>(
    THEME_CSS_VARS_KEY,
    generateThemeCssVars(cachedThemePalette),
  );

  // Inject CSS vars into document head
  useEffect(() => {
    insertStyle(CUSTOM_THEME_KEY, cachedThemeCssVars);
    // Also sync with Starlight's data-theme for Tailwind dark variant
    applyRootStyleVar(resolvedThemeMode, cachedThemePalette);
  }, [cachedThemeCssVars, cachedThemePalette, resolvedThemeMode]);

  // Update palette + css vars when theme color changes
  useEffect(() => {
    const nextThemePalette = themeFromSourceColor(argbFromHex(themeColorSetting || DEFAULT_COLOR));

    if (!isEqual(nextThemePalette, cachedThemePalette)) {
      setCachedThemePalette(nextThemePalette);
    }

    const nextThemeCssVars = generateThemeCssVars(nextThemePalette);
    if (nextThemeCssVars !== cachedThemeCssVars) {
      setCachedThemeCssVars(nextThemeCssVars);
    }
  }, [themeColorSetting]); // eslint-disable-line react-hooks/exhaustive-deps

  const setThemeColor = useCallback(
    async (color: string) => {
      if (color === themeColorSetting) return;
      setThemeColorSetting(color || DEFAULT_COLOR);

      const materialColor = themeFromSourceColor(argbFromHex(color || DEFAULT_COLOR));
      if (isEqual(materialColor, cachedThemePalette)) return;
      setCachedThemePalette(materialColor);

      const themeCssVars = generateThemeCssVars(materialColor);
      setCachedThemeCssVars(themeCssVars);
    },
    [
      themeColorSetting,
      cachedThemePalette,
      setCachedThemeCssVars,
      setCachedThemePalette,
      setThemeColorSetting,
    ],
  );

  const applyThemeMode = useCallback((mode: ResolvedThemeMode) => {
    changeHtmlThemeMode(mode);
    setResolvedThemeMode(mode);
    // Sync data-theme for Starlight compatibility
    if (isBrowser) {
      document.documentElement.setAttribute("data-theme", mode);
    }
  }, []);

  // Initialize theme mode on mount
  useEffect(() => {
    const stored = themeModeSetting;

    if (stored === ThemeMode.SYSTEM) {
      applyThemeMode(getSystemThemeMode());
    } else if (stored === ThemeMode.LIGHT || stored === ThemeMode.DARK) {
      applyThemeMode(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (themeModeSetting === ThemeMode.SYSTEM) {
        applyThemeMode(mql.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [applyThemeMode, themeModeSetting]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      const nextResolvedMode = mode === ThemeMode.SYSTEM ? getSystemThemeMode() : mode;
      applyThemeMode(nextResolvedMode);
      if (mode !== themeModeSetting) {
        setThemeModeSetting(mode);
      }

      // Sync with Starlight's localStorage key
      if (isBrowser) {
        localStorage.setItem(
          STARLIGHT_THEME_STORAGE_KEY,
          mode === ThemeMode.LIGHT || mode === ThemeMode.DARK ? mode : "",
        );

        window.StarlightThemeProvider?.updatePickers(toStarlightTheme(mode));
      }
    },
    [applyThemeMode, themeModeSetting, setThemeModeSetting],
  );

  const currentThemeMode = useMemo<ResolvedThemeMode>(() => {
    if (themeModeSetting === ThemeMode.DARK) {
      return ThemeMode.DARK;
    }

    if (themeModeSetting === ThemeMode.LIGHT) {
      return ThemeMode.LIGHT;
    }

    return resolvedThemeMode;
  }, [resolvedThemeMode, themeModeSetting]);

  useEffect(() => {
    applyRootStyleVar(currentThemeMode, cachedThemePalette);
  }, [cachedThemePalette, currentThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themePalette: cachedThemePalette,
        themeCssVars: cachedThemeCssVars,
        themeColor: themeColorSetting || DEFAULT_COLOR,
        setThemeColor,
        themeMode: themeModeSetting as ThemeMode,
        currentThemeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
