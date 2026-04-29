import type { ReactNode } from "react";
import type { SidebarEntry } from "@/config/sidebar";
import Sidebar from "@/components/layout/sidebar";
import TableOfContents from "@/components/layout/table-of-contents";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  sidebar: SidebarEntry[];
  headings?: Heading[];
  currentPath: string;
  children: ReactNode;
}

export default function DocLayout({ sidebar, headings = [], currentPath, children }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={sidebar} currentPath={currentPath} />
      <main className="flex-1 min-w-0 px-6 py-8 max-w-4xl mx-auto">
        <article className="prose prose-neutral dark:prose-invert max-w-none">{children}</article>
      </main>
      {headings.length > 0 && (
        <aside className="hidden xl:block w-64 shrink-0">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>
  );
}
