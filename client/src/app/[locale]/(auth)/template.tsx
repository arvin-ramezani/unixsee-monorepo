import { AuthPanel } from "@/components/auth/auth-panel";

export default function AuthTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthPanel>{children}</AuthPanel>;
}
