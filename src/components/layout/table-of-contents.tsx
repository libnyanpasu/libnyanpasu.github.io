import type { Heading } from "@/components/layout/doc-layout";

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const filtered = headings.filter((h) => h.depth <= 3);

  return (
    <nav className="sticky top-8 px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {filtered.map((heading) => (
          <li key={heading.slug} style={{ paddingLeft: `${(heading.depth - 1) * 12}px` }}>
            <a
              href={`#${heading.slug}`}
              className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 py-0.5 transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
