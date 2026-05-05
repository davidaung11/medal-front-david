import { Skeleton } from "@/components/ui/Skeleton";

export function MissionRoomPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64 rounded-xl" />
      <Skeleton className="h-5 w-[420px] rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-2xl border border-slate-200 bg-slate-50" />
        <Skeleton className="h-40 rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
      <Skeleton className="h-[360px] rounded-2xl border border-slate-200 bg-slate-50" />
    </div>
  );
}
