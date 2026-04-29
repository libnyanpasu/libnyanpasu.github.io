"use client";

import { useEffect } from "react";
import { ThemeMode, useThemeContext } from "@/components/theme/theme-context";

const parseStarlightTheme = (theme: string | null): ThemeMode => {
  if (theme === ThemeMode.LIGHT || theme === ThemeMode.DARK) {
    return theme;
  }

  return ThemeMode.SYSTEM;
};

export default function ThemeToggle() {
  const { setThemeMode } = useThemeContext();

  useEffect(() => {
    const syncFromStarlight = () => {
      void setThemeMode(parseStarlightTheme(localStorage.getItem("starlight-theme")));
    };

    const onChange = (event: Event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;
      if (!event.target.closest("starlight-theme-select")) return;
      void setThemeMode(parseStarlightTheme(event.target.value));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "starlight-theme") {
        void setThemeMode(parseStarlightTheme(event.newValue));
      }
    };

    syncFromStarlight();
    document.addEventListener("change", onChange);
    window.addEventListener("storage", onStorage);

    return () => {
      document.removeEventListener("change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [setThemeMode]);

  return null;
}
