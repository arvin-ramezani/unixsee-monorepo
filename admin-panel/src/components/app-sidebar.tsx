"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  GlobeIcon,
  HomeIcon,
  ServerIcon,
  TicketIcon,
  UserIcon,
  ActivityIcon,
  BellIcon,
  SettingsIcon,
  Puzzle,
  ClipboardList,
  ShieldCheck,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const data = {
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

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
  };
}) {
  const { open, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const activeUrl = [...data.navMain]
    .sort((a, b) => b.url.length - a.url.length)
    .find(
      (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
    )?.url;

  return (
    <Sidebar className="" side="right" dir="rtl" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent className="p-4 px-2">
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title} id={item.url} className="my-1">
              <SidebarMenuButton
                isActive={activeUrl === item.url}
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
        <SidebarTrigger
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          className={cn(
            "hidden transition-[width,padding] duration-100 xl:flex",
            open
              ? "h-10 w-full justify-center px-2.5"
              : "size-8 shrink-0 justify-center px-0",
          )}
        >
          {open ? (
            <ChevronRightIcon className="size-4 shrink-0" />
          ) : (
            <ChevronLeftIcon className="size-4 shrink-0" />
          )}
          {open && (
            <span className="truncate text-sm font-medium">بستن منو</span>
          )}
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}
