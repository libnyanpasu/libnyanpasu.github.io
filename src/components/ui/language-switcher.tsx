interface Props {
  locale: string;
  currentPath: string;
}

const locales = [
  { code: "en", label: "English" },
  { code: "zh-cn", label: "简体中文" },
];

function switchLocale(currentPath: string, fromLocale: string, toLocale: string): string {
  if (toLocale === "en") {
    return currentPath.replace(/^\/zh-cn/, "") || "/";
  }
  if (fromLocale === "en") {
    return `/zh-cn${currentPath}`;
  }
  return currentPath;
}

export default function LanguageSwitcher({ locale, currentPath }: Props) {
  return (
    <div className="relative group">
      <button
        aria-label="Change language"
        className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
          />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow-lg overflow-hidden z-50 min-w-36">
        {locales.map((l) => (
          <a
            key={l.code}
            href={switchLocale(currentPath, locale, l.code)}
            className={`block px-4 py-2 text-sm transition-colors ${
              locale === l.code
                ? "bg-neutral-100 dark:bg-neutral-700 font-medium"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
