import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import NavbarLayout from "./navbar-layout";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user || null;

  return <NavbarLayout user={user} />;
}