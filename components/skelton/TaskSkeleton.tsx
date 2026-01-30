import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-50" />
            <Skeleton className="h-3 w-37.5" />
          </div>
        </div>
      ))}
    </div>
  );
}