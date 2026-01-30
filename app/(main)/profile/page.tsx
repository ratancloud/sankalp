import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile, password, and active sessions",
};

export default function ProfilePage() {
  return <ProfileClient />;
}