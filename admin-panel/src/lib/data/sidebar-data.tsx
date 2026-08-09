import {
  HomeIcon,
  GlobeIcon,
  ServerIcon,
  UserIcon,
  TicketIcon,
  PlusIcon,
  ActivityIcon,
  BellIcon,
  SettingsIcon,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { id: "0", label: "نمای‌کلی", icon: <HomeIcon />, href: "/" },
  { id: "1", label: "وب‌سایت‌ها", icon: <GlobeIcon />, href: "/websites" },
  { id: "2", label: "سرورها", icon: <ServerIcon />, href: "/servers" },
  { id: "3", label: "کاربران", icon: <UserIcon />, href: "/users" },
  { id: "4", label: "تیکت‌ها", icon: <TicketIcon />, href: "/tickets" },
  {
    id: "5",
    label: "خدمات تکمیلی",
    icon: <PlusIcon />,
    href: "/complementary-services",
  },
  {
    id: "6",
    label: "درخواست‌های پلن",
    icon: <PlusIcon />,
    href: "/plan-requests",
  },
  { id: "7", label: "فعالیت‌ها", icon: <ActivityIcon />, href: "/activities" },
  { id: "8", label: "اعلان‌ها", icon: <BellIcon />, href: "/notifications" },
  { id: "9", label: "تنظیمات", icon: <SettingsIcon />, href: "/settings" },
];
