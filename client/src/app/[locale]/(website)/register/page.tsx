import { Input } from "@/components/ui/input";

export default function RegisterPage({}) {
  return (
    <main className="container h-dvh">
      <form className="mx-auto flex max-w-sm flex-col gap-4 py-50">
        <Input placeholder="نام کاربری" />
        <Input type="password" placeholder="رمز عبور" />
      </form>
    </main>
  );
}
