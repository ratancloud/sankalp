export default function FocusSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8 animate-pulse">
      {/* Header Area */}
      <div className="space-y-5">
        <div className="h-9 w-20 bg-muted rounded-md" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative space-y-5">
        <div className="text-center space-y-5 w-full max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="h-10 w-3/4 bg-muted rounded mx-auto" />
        </div>

        {/* Timer Digits */}
        <div className="h-32 w-64 bg-muted/50 rounded-3xl" />

        {/* Linear Progress Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-10 bg-muted rounded" />
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full" />
        </div>
      </div>

      {/* Controls Footer */}
      <div className="p-6 flex items-center justify-center gap-8 md:gap-12">
        <div className="h-14 w-14 rounded-full bg-muted" />
        <div className="h-24 w-24 rounded-[36px] bg-muted" />
        <div className="h-14 w-14 rounded-full bg-muted" />
      </div>
    </div>
  );
}