import { isBrowser } from "@/consts";
import { baseLocale, getLocale } from "@/paraglide/runtime";
import type { ComponentProps } from "react";

export default function LocalizeLink({ href, ...props }: ComponentProps<"a">) {
  if (!isBrowser) {
    return null;
  }

  const locale = getLocale();

  return <a href={locale !== baseLocale ? `/${locale}${href}` : href} {...props} />;
}
