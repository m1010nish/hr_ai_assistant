import { LayoutDashboard, FileText, MessagesSquare } from "lucide-react";

/* Navigation is intentionally short. Three destinations cover the whole job. */
export const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/resumes",
    label: "Resumes",
    icon: FileText,
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    icon: MessagesSquare,
  },
];

export function isActivePath(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
