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
  ShieldCheck,
  MessageSquareText,
  MailIcon,
  Puzzle,
  ClipboardList,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "نمای‌کلی",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "وب‌سایت‌ها",
      url: "/websites",
      icon: GlobeIcon,
    },
    {
      title: "سرورها",
      url: "/servers",
      icon: ServerIcon,
    },
    {
      title: "کاربران",
      url: "/users",
      icon: UserIcon,
    },
    {
      title: "بررسی احراز هویت",
      url: "/users/authorization",
      icon: ShieldCheck,
    },
    {
      title: "تیکت‌ها",
      url: "/tickets",
      icon: TicketIcon,
    },
    {
      title: "پیام‌های یونیکسی",
      url: "/unixsee-messages",
      icon: MessageSquareText,
    },
    {
      title: "تماس با ما",
      url: "/contact-messages",
      icon: MailIcon,
    },
    {
      title: "خدمات تکمیلی",
      url: "/complementary-services",
      icon: Puzzle,
    },
    {
      title: "درخواست‌های پلن",
      url: "/plan-requests",
      icon: ClipboardList,
    },
    {
      title: "فعالیت‌ها",
      url: "/activities",
      icon: ActivityIcon,
    },
    {
      title: "اعلان‌ها",
      url: "/notifications",
      icon: BellIcon,
    },
    {
      title: "تنظیمات",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

// export const SIDEBAR_ITEMS = [
//   { id: "0", label: "نمای‌کلی", icon: <HomeIcon />, href: "/" },
//   { id: "1", label: "وب‌سایت‌ها", icon: <GlobeIcon />, href: "/websites" },
//   { id: "2", label: "سرورها", icon: <ServerIcon />, href: "/servers" },
//   { id: "3", label: "کاربران", icon: <UserIcon />, href: "/users" },
//   { id: "4", label: "تیکت‌ها", icon: <TicketIcon />, href: "/tickets" },
//   {
//     id: "5",
//     label: "خدمات تکمیلی",
//     icon: <PlusIcon />,
//     href: "/complementary-services",
//   },
//   {
//     id: "6",
//     label: "درخواست‌های پلن",
//     icon: <PlusIcon />,
//     href: "/plan-requests",
//   },
//   { id: "7", label: "فعالیت‌ها", icon: <ActivityIcon />, href: "/activities" },
//   { id: "8", label: "اعلان‌ها", icon: <BellIcon />, href: "/notifications" },
//   { id: "9", label: "تنظیمات", icon: <SettingsIcon />, href: "/settings" },
// ];
