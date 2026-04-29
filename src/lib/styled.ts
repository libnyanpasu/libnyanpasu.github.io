import { isBrowser } from "@/consts";

export function insertStyle(id: string, style: string) {
  if (!isBrowser) {
    return;
  }

  const old = document.getElementById(id);
  if (old) document.head.removeChild(old);
  const el = document.createElement("style");
  el.id = id;
  el.innerHTML = style;
  document.head.appendChild(el);
}
