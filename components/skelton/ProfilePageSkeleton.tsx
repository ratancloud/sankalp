import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function ProfilePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8 animate-pulse">
      
      {/* 1. Profile Hero Skeleton */}
      <Card className="relative overflow-hidden rounded-2xl border border-border/50 pt-0">
        <Skeleton className="h-32 sm:h-40 rounded-t-2xl w-full" />
        <div className="absolute top-16 sm:top-20 left-6 sm:left-10">
          <div className="rounded-full p-1.5 bg-background">
            <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full" />
          </div>
        </div>
        <CardContent className="pt-16 sm:pt-20 px-6 sm:px-10 pb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-3 mt-4 sm:mt-0">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Security Card Skeleton */}
        <Card className="rounded-xl border border-border/50">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full max-w-62.5 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 py-3 flex justify-end">
            <Skeleton className="h-9 w-32 rounded-md" />
          </CardFooter>
        </Card>

        {/* 3. Active Sessions Skeleton */}
        <Card className="rounded-xl border border-border/50 h-full">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full max-w-50 mt-1" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Skeleton className="h-4 w-32" />
                        {i === 1 && <Skeleton className="h-4 w-12 rounded-full" />}
                      </div>
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}