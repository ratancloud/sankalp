"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Key, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import ProfileHeroCard from "@/components/profile/ProfileHeroCard";
import ActiveSessionsCard from "@/components/profile/ActiveSessionsCard";
import ProfilePageSkeleton from "@/components/skelton/ProfilePageSkeleton";

export default function ProfileClient() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
  });

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (isPending) return;
    if (!data?.user) {
      toast.error("Please sign in.");
      router.replace("/login");
    }
  }, [data, isPending, router]);

  /* ---------- Password Change ---------- */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.current.trim()) return toast.error("Please enter your current password");
    if (!passwordData.new.trim()) return toast.error("Please enter a new password");
    if (passwordData.new.length < 8) return toast.error("New password must be at least 8 characters");

    setIsUpdatingPassword(true);
    const { error } = await authClient.changePassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.new,
      revokeOtherSessions: true,
    });
    setIsUpdatingPassword(false);

    if (error) return toast.error(error.message || "Update failed");

    toast.success("Password updated successfully");
    setPasswordData({ current: "", new: "" });
  };

  if (isPending) return <ProfilePageSkeleton />;
  if (!data?.user || !data.session) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      
      {/* 1. Profile Hero Section */}
      <ProfileHeroCard
        name={data.user.name || "User"}
        email={data.user.email}
        emailVerified={data.user.emailVerified}
        role={data.user.role || "User"}
        createdAt={new Date(data.user.createdAt)}
        image={data.user.image}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Password & Security */}
        <Card className="rounded-xl border border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Security</CardTitle>
            </div>
            <CardDescription>
              Update your password. This will revoke other sessions.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-background/50"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-background/50"
                    minLength={8}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-right">
                  Min. 8 characters
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 bg-muted/20 py-3 flex justify-end">
              <Button type="submit" size="sm" disabled={isUpdatingPassword}>
                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* 3. Active Sessions */}
        <ActiveSessionsCard currentSessionId={data.session.id} />
      </div>
    </div>
  );
}