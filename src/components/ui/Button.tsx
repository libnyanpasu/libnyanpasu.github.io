import type { ReactNode } from "react";

type Variant = "flat" | "tonal" | "outlined" | "ghost";

interface Props {
  href?: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  flat: "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400",
  tonal:
    "bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800",
  outlined:
    "border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800",
  ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
};

export default function Button({ href, variant = "flat", children, className = "" }: Props) {
  const cls = `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return <button className={cls}>{children}</button>;
}
