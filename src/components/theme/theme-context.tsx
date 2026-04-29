import { isEqual, kebabCase } from "lodash-es";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
} from "@material/material-color-utilities";

// ---------------------------------------------------------------------------
// Color utilities (ported from @nyanpasu/utils)
// ---------------------------------------------------------------------------
const alpha = (color: string, value: number) =>
  `color-mix(in srgb, ${color} ${(value * 100).toFixed(2)}%, transparent ${((1 - value) * 100).toFixed(2)}%)`;

const lighten = (color: string, value: number) =>
  `color-mix(in lch, ${color} ${((1 - value) * 100).toFixed(2)}%, white ${(value * 100).toFixed(2)}%)`;

const darken = (color: string, value: number) =>
  `color-mix(in lch, ${color} ${((1 - value) * 100).toFixed(2)}%, black ${(value * 100).toFixed(2)}%)`;

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------
const isBrowser = typeof window !== "undefined";

function insertStyle(id: string, style: string) {
  if (!isBrowser) return;
  const old = document.getElementById(id);
  if (old) document.head.removeChild(old);
  const el = document.createElement("style");
  el.id = id;
  el.innerHTML = style;
  document.head.appendChild(el);
}

// ---------------------------------------------------------------------------
// Theme mode
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Generate CSS custom properties from a Material theme
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// DOM / localStorage helpers (SSR-safe)
// ---------------------------------------------------------------------------
const STORAGE_THEME_MODE = "nyanpasu-theme-mode";
const STORAGE_THEME_COLOR = "nyanpasu-theme-color";

const getSystemThemeMode = (): ResolvedThemeMode =>
  isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;

const changeHtmlThemeMode = (mode: ResolvedThemeMode) => {
  if (!isBrowser) return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === ThemeMode.DARK);
  root.classList.toggle("light", mode === ThemeMode.LIGHT);
};

const getThemeScheme = (theme: Theme, mode: ResolvedThemeMode) => {
  const scheme = theme.schemes[mode];
  return typeof (scheme as any).toJSON === "function" ? (scheme as any).toJSON() : scheme;
};

const applyRootStyleVar = (mode: ResolvedThemeMode, themePalette: Theme) => {
  if (!isBrowser) return;
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

// ---------------------------------------------------------------------------
// SSR-safe localStorage hook (replaces @uidotdev/usehooks client-only hook)
// ---------------------------------------------------------------------------
function useSsrSafeLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  if (!isBrowser) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useState<T>(initialValue);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or private mode — silently ignore
    }
  }, [key, value]);

  return [value, setValue];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
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

export function useExperimentalThemeContext() {
  return useContext(ThemeContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ExperimentalThemeProvider({ children }: { children: ReactNode }) {
  // Persistent user preferences (replaces useSetting with useSsrSafeLocalStorage)
  const [themeModeSetting, setThemeModeSetting] = useSsrSafeLocalStorage<ThemeMode>(
    STORAGE_THEME_MODE,
    ThemeMode.SYSTEM,
  );
  const [themeColorSetting, setThemeColorSetting] = useSsrSafeLocalStorage<string>(
    STORAGE_THEME_COLOR,
    DEFAULT_COLOR,
  );

  // Resolved theme (auto → system preference)
  const [resolvedThemeMode, setResolvedThemeMode] = useState<ResolvedThemeMode>(
    isBrowser ? getSystemThemeMode() : ThemeMode.LIGHT,
  );

  // Material theme palette (cached)
  const [cachedThemePalette, setCachedThemePalette] = useSsrSafeLocalStorage<Theme>(
    THEME_PALETTE_KEY,
    themeFromSourceColor(argbFromHex(themeColorSetting || DEFAULT_COLOR)),
  );

  // CSS vars string (cached)
  const [cachedThemeCssVars, setCachedThemeCssVars] = useSsrSafeLocalStorage<string>(
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
    if (!isBrowser) return;
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
      if (mode !== ThemeMode.SYSTEM) {
        applyThemeMode(mode as ResolvedThemeMode);
      }
      if (mode !== themeModeSetting) {
        setThemeModeSetting(mode);
      }
      // Sync with Starlight's localStorage key
      if (isBrowser) {
        localStorage.setItem(
          "starlight-theme",
          mode === ThemeMode.LIGHT || mode === ThemeMode.DARK ? mode : "",
        );
      }
    },
    [applyThemeMode, themeModeSetting, setThemeModeSetting],
  );

  const currentThemeMode = useMemo<ResolvedThemeMode>(() => {
    if (themeModeSetting === ThemeMode.DARK) return ThemeMode.DARK;
    if (themeModeSetting === ThemeMode.LIGHT) return ThemeMode.LIGHT;
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
