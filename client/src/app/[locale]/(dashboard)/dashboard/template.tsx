"use client";

import type { ReactNode } from "react";

import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";

/**
 * Remounts on every dashboard segment navigation so page content fades in once.
 * Skeletons from `loading.tsx` still cover async waits; this only animates the
 * first paint of each route's children.
 */
export default function DashboardTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardFadeIn>{children}</DashboardFadeIn>;
}
