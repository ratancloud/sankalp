import SignUpForm from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Optional: Background gradients/blobs can go here if you have them in global css */}
      <div className="relative w-[90vw] md:w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}