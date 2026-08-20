import Logo from "@/components/common/logo";
import { LocaleSwitcher } from "@/components/dashboard/locale-switcher";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      data-auth-shell
      className="bg-background relative flex h-dvh flex-col overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-glow-blue-soft absolute inset-s-1/2 top-[-20%] size-[min(42rem,80vw)] -translate-x-1/2 rounded-full opacity-70 blur-3xl dark:opacity-20" />
        <div className="bg-glow-blue-faint absolute inset-e-[-10%] bottom-[-10%] size-[min(28rem,60vw)] rounded-full opacity-60 blur-3xl dark:opacity-10" />
      </div>

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Logo className="w-24 lg:w-28" />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
        <AuthPanel>{children}</AuthPanel>
      </main>
    </div>
  );
}
