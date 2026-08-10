"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  GlobeIcon,
  HomeIcon,
  Map,
  PieChart,
  ServerIcon,
  TicketIcon,
  UserIcon,
  ActivityIcon,
  BellIcon,
  SettingsIcon,
  Puzzle,
  ClipboardList,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import Link from "next/link";

// import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
// import { NavUser } from "@/components/nav-user";
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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// This is sample data.
const data = {
  navMain: [
    {
      title: "نمای‌کلی",
      url: "/",
      icon: HomeIcon,
      isActive: true,
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
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const pathname = usePathname();
  const activeUrl = data.navMain.find(
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
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          className={cn(
            "transition-[width,padding] hidden xl:flex duration-100",
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

        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
