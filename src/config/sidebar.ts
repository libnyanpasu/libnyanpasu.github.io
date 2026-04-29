export interface NavItem {
  text: string;
  link: string;
}

export interface SidebarGroup {
  text: string;
  link?: string;
  items?: NavItem[];
}

export type SidebarEntry = NavItem | SidebarGroup;

export const navConfig: Record<string, NavItem[]> = {
  en: [
    { text: "Home", link: "/" },
    { text: "Tutorial", link: "/introduction" },
    { text: "FAQ", link: "/others/faq" },
  ],
  "zh-cn": [
    { text: "主页", link: "/zh-cn/" },
    { text: "简介", link: "/zh-cn/introduction" },
    { text: "常见问题", link: "/zh-cn/others/faq" },
  ],
};
