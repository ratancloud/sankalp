import { Skeleton } from "@/components/ui/skeleton";

export default function TaskSettingCardSkeleton() {
  return (
    <div className="group flex w-full min-h-36 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card transition-all">
      {/* Left Column Skeleton (Sidebar) */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-between border-r border-border/40 py-3 px-2 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="flex flex-col items-center gap-2">
          {/* Time Skeleton */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-8" />
          </div>
          {/* Duration Pill Skeleton */}
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>

        {/* Date Range Skeleton */}
        <div className="mt-3 flex flex-col items-center w-full pt-2 border-t border-black/5 dark:border-white/5 gap-1.5">
          <Skeleton className="h-3 w-10" />
          <div className="h-2 w-4 opacity-30" /> {/* "to" spacer */}
          <Skeleton className="h-3 w-10" />
        </div>
      </div>

      {/* Right Column Skeleton (Content) */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Top Row: Title & Menu */}
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-6 rounded-md shrink-0" />
        </div>

        {/* Middle: Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        {/* Bottom Row: Privacy & Days */}
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pt-2">
          {/* Privacy Tag Skeleton */}
          <Skeleton className="h-6 w-16 rounded-md" />

          {/* Days of Week Skeleton */}
          <div className="flex items-center gap-1">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}