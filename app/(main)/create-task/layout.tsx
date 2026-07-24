import { requirePageUser } from "@/lib/require-page-access";

export default async function CreateTaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageUser();

  return children;
}