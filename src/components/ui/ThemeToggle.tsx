"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
    >
      {dark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm-3-.75H2.25a.75.75 0 0 0 0 1.5H4.5a.75.75 0 0 0 0-1.5Zm16.5 0h-2.25a.75.75 0 0 0 0 1.5H21a.75.75 0 0 0 0-1.5ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM5.636 17.364a.75.75 0 0 0 1.06 1.06l1.592-1.591a.75.75 0 0 0-1.061-1.06l-1.591 1.591ZM17.364 5.636a.75.75 0 0 0-1.06 1.06l1.591 1.592a.75.75 0 0 0 1.06-1.061l-1.591-1.591ZM5.636 6.696l1.591 1.591a.75.75 0 0 0 1.06-1.06L6.696 5.636a.75.75 0 0 0-1.06 1.06ZM15.773 17.955l1.591 1.591a.75.75 0 1 0 1.06-1.06l-1.591-1.591a.75.75 0 1 0-1.06 1.06Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
