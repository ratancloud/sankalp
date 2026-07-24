import SignUpForm from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Sankalp account and start tracking your productivity today.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] dark:bg-[radial-gradient(#1e1535_1px,transparent_1px)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,oklch(0.44_0.22_275/0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,oklch(0.68_0.20_278/0.18),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,oklch(0.55_0.19_165/0.07),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,oklch(0.72_0.18_165/0.10),transparent)]" />
      </div>

      <div className="relative z-10 w-[92vw] md:w-full max-w-md py-8">
        <SignUpForm />
      </div>
    </div>
  );
}