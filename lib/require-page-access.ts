import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requirePageUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requirePageAdmin() {
  const user = await requirePageUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}