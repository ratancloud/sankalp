import LoginForm from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Time Arena account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="relative w-[90vw] md:w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}