import { requirePageAdmin } from "@/lib/require-page-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageAdmin();

  return children;
}