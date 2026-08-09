import { UserDetailsPageClient } from "@/components/users/user-details-page-client";

export type UserDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <UserDetailsPageClient id={id} />
    </div>
  );
}
