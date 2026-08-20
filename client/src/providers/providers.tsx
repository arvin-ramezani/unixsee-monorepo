import { PropsWithChildren } from "react";
import { NextIntlClientProvider } from "next-intl";

import { ThemeProvider } from "./theme-provider";
import { LightHeaderStoreProvider } from "./light-header-provider";
import { ScrollLockedStoreProvider } from "./scroll-lock-store-provider";
import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import SmoothScrollProvider from "./smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppScrollbar } from "@/components/common/app-scrollbar";
import { getServerAccessToken } from "@/lib/auth/server-auth";
import { getServerClockOffsetInSeconds } from "@/lib/auth/server-cookie";

export type ProvidersProps = PropsWithChildren;

export default async function Providers({ children }: ProvidersProps) {
  const accessToken = await getServerAccessToken();
  const serverClockOffsetInSeconds = accessToken
    ? await getServerClockOffsetInSeconds()
    : null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthStoreProvider
        initialState={{
          accessToken,
          serverClockOffsetInSeconds,
        }}
      >
        <LightHeaderStoreProvider>
          <ScrollLockedStoreProvider>
            <AppScrollbar />

            <SmoothScrollProvider>
              <NextIntlClientProvider>{children}</NextIntlClientProvider>
              <Toaster />
            </SmoothScrollProvider>
          </ScrollLockedStoreProvider>
        </LightHeaderStoreProvider>
      </AuthStoreProvider>
    </ThemeProvider>
  );
}
