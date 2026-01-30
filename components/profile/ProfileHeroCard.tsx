"use client";

import { CheckCircle2, Camera, UserPen, Mail, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeroCardProps {
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  image?: string | null;
}

export default function ProfileHeroCard({
  name,
  email,
  emailVerified,
  role,
  createdAt,
  image,
}: ProfileHeroCardProps) {
  return (
    <Card className="relative overflow-visible rounded-2xl border border-border/50 shadow-sm pt-0">
      {/* Background Gradient */}
      <div className="h-32 sm:h-40 rounded-t-2xl bg-linear-to-r from-primary/10 via-primary/5 to-background border-b" />

      {/* Avatar Container - Overlaps the background */}
      <div className="absolute top-16 sm:top-20 left-6 sm:left-10">
        <div className="rounded-full p-1.5 bg-background shadow-md">
          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border border-border">
            <AvatarImage src={image ?? undefined} alt={name} className="object-cover" />
            <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="pt-16 sm:pt-20 px-6 sm:px-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
          
          {/* User Details */}
          <div className="space-y-2 mt-4 sm:mt-0">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-sm">{email}</span>
                {emailVerified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-1" />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
              <Badge variant="secondary" className="font-normal">
                {role}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <CalendarDays className="h-3 w-3" />
                Joined {createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="sm" className="gap-2">
              <UserPen className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Camera className="h-4 w-4" />
              Change Photo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}