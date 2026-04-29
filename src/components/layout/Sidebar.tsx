import type { SidebarEntry } from "../../config/sidebar";

interface Props {
  items: SidebarEntry[];
  currentPath: string;
}

export default function Sidebar({ items, currentPath }: Props) {
  return (
    <nav className="hidden md:block w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 px-4 py-8">
      <ul className="space-y-1">
        {items.map((item, i) => {
          if ("items" in item && item.items) {
            return (
              <li key={i}>
                <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-4 mb-1">
                  {item.text}
                </span>
                <ul className="space-y-0.5">
                  {item.items.map((child, j) => (
                    <li key={j}>
                      <a
                        href={child.link}
                        className={`block px-3 py-1.5 rounded text-sm transition-colors ${
                          currentPath === child.link
                            ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {child.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }
          return (
            <li key={i}>
              <a
                href={item.link}
                className={`block px-3 py-1.5 rounded text-sm transition-colors ${
                  currentPath === item.link
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
