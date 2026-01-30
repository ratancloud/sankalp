"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Skeleton */}
      <Card className="rounded-2xl border overflow-hidden">
        <div className="h-32 bg-muted/40" />
        <div className="relative px-6 sm:px-10 pb-6">
          <div className="absolute -top-14">
             <Skeleton className="h-28 w-28 rounded-full border-4 border-background" />
          </div>
          <div className="pt-16 flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Skeleton */}
        <Card className="rounded-xl border">
          <div className="px-6 py-4 border-b">
            <Skeleton className="h-5 w-32" />
          </div>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end pt-2">
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Sessions Skeleton */}
        <Card className="rounded-xl border">
          <div className="px-6 py-4 border-b">
             <Skeleton className="h-5 w-40" />
          </div>
          <CardContent className="p-0">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                 <Skeleton className="h-10 w-10 rounded-lg" />
                 <div className="space-y-2 flex-1">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-24" />
                 </div>
                 <Skeleton className="h-8 w-8 rounded-full" />
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}