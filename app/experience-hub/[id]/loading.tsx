import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="px-2.5 pb-2.5 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <div className="flex min-h-0 gap-4 overflow-hidden animate-pulse">
        <section className="min-w-0 flex-1 overflow-y-auto pr-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <Skeleton className="h-[250px] rounded-none" />
            <div className="space-y-4 p-5">
              <Skeleton className="h-10 w-2/3 rounded-lg" />
              <Skeleton className="h-5 w-1/3 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </section>

        <aside className="w-[300px] shrink-0">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
