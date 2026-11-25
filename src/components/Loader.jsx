const cn = (...classes) => classes.filter(Boolean).join(" ");

// Branded loading states: full screen (app start / route change) and inline (inside a card or page).
export function PageLoader({ className, full }) {
  return (
    <div
      className={cn(
        "grid place-items-center",
        full ? "min-h-screen bg-page" : "py-20",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="">
          <img
            src="/logo.png"
            alt="নবকথন"
            className={cn("animate-pulse", full ? "h-12" : "h-8 opacity-80")}
          />
          <span className="text-xl text-center  text-blue-600 font-bold block">Author</span>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] rounded-full bg-brand-600" />
        </div>
      </div>
    </div>
  );
}

// Grey placeholder blocks while a list or card loads.
export const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse rounded-xl bg-slate-200/70", className)} />
);

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 p-5">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-4">
        <Skeleton className="size-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);
