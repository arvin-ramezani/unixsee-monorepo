import { PropsWithChildren } from "react";
import { NextIntlClientProvider } from "next-intl";

import { ThemeProvider } from "./theme-provider";
import { LightHeaderStoreProvider } from "./light-header-provider";
import { ScrollLockedStoreProvider } from "./scroll-lock-store-provider";
import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import SmoothScrollProvider from "./smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppScrollbar } from "@/components/common/app-scrollbar";

export type ProvidersProps = PropsWithChildren;

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthStoreProvider>
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
