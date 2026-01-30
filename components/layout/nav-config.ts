import {
  House,
  Info,
  Mail,
  LayoutGrid,
  PlusCircle,
  CheckSquare,
  Users,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const GUEST_NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: House },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact-us", icon: Mail },
];

export const AUTH_NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: House },
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Schedule", href: "/create-task", icon: PlusCircle },
  { name: "Tasks", href: "/task", icon: CheckSquare },
  { name: "Friends", href: "/friends", icon: Users },
];