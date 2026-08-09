import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityHistoryLoading() {
  return (
    <div aria-busy="true" className="w-full max-w-[72rem] pb-8 pt-6 sm:pt-7">
      <Skeleton className="h-9 w-52 motion-reduce:animate-none" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl motion-reduce:animate-none" />
      <Panel className="mt-7 overflow-hidden">
        <div className="flex min-h-17 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 motion-reduce:animate-none" />
            <Skeleton className="h-3 w-36 motion-reduce:animate-none" />
          </div>
        </div>
        <div className="grid gap-4 border-b border-border bg-muted/20 px-4 py-4 sm:px-6 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
              <Skeleton className="h-11 w-full motion-reduce:animate-none" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-none motion-reduce:animate-none" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-border px-4 py-5 first:border-t-0 sm:px-6 lg:grid-cols-[40px_minmax(0,1fr)_184px] lg:gap-x-5"
          >
            <Skeleton className="size-10 rounded-full motion-reduce:animate-none" />
            <div className="max-w-2xl space-y-2">
              <Skeleton className="h-4 w-4/5 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-2/5 motion-reduce:animate-none" />
            </div>
            <div className="col-span-2 ms-14 grid grid-cols-[4.5rem_3rem] gap-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:ms-0 lg:w-[184px] lg:self-center">
              <Skeleton className="h-6 w-18 motion-reduce:animate-none" />
              <Skeleton className="h-4 w-12 self-center motion-reduce:animate-none" />
              <Skeleton className="col-span-2 h-8 w-24 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
