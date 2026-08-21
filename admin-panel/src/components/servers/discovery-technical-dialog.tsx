"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  getAgentCommandAction,
  requestDiscoveryStackRefreshAction,
  type AgentCommandDto,
} from "@/actions/websites/website-agent-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WebsiteDiscoveryType } from "@/lib/data/servers-data";

const TERMINAL = new Set<AgentCommandDto["status"]>([
  "SUCCEEDED",
  "FAILED",
  "EXPIRED",
]);
const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const dateLabel = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export function DiscoveryTechnicalDialog({
  discovery,
}: {
  discovery: WebsiteDiscoveryType;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState<AgentCommandDto | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    setMessage(null);
    startTransition(async () => {
      const created = await requestDiscoveryStackRefreshAction(discovery.id);
      if (!created.ok) {
        setMessage(created.message);
        return;
      }
      setCommand(created.data);
      let current = created.data;
      for (
        let attempt = 0;
        attempt < 150 && !TERMINAL.has(current.status);
        attempt += 1
      ) {
        await sleep(2_000);
        const result = await getAgentCommandAction(current.id);
        if (!result.ok) {
          setMessage(result.message);
          return;
        }
        current = result.data;
        setCommand(current);
      }
      if (current.status === "SUCCEEDED") {
        setMessage("تازه‌سازی پشته با موفقیت ثبت شد.");
        router.refresh();
      } else if (current.status === "FAILED" || current.status === "EXPIRED") {
        setMessage(
          `تازه‌سازی ناموفق بود${current.errorCode ? `: ${current.errorCode}` : "."} آخرین مقادیر موفق حفظ شده‌اند.`,
        );
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        اطلاعات فنی
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>اطلاعات فنی {discovery.domain}</DialogTitle>
            <DialogDescription>
              آخرین وضعیت موجودی OLS، probe محلی و ترافیک محدودشده این دامنه.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 overflow-y-auto px-4 pb-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">vhost</dt>
              <dd dir="ltr">{discovery.virtualHostName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">حضور</dt>
              <dd>{discovery.isPresent === false ? "حذف‌شده" : "فعال"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">WordPress</dt>
              <dd dir="ltr">{discovery.wordpressVersion ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PHP</dt>
              <dd dir="ltr">{discovery.phpVersion ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Imagick</dt>
              <dd dir="ltr">{discovery.imagickVersion ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">آخرین بررسی</dt>
              <dd>{dateLabel(discovery.stackCheckedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">آخرین موفقیت</dt>
              <dd>{dateLabel(discovery.stackLastSucceededAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">فعال در ۳ دقیقه</dt>
              <dd>
                {discovery.activeVisitorCount?.toLocaleString("fa-IR") ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">بازدیدکننده ۲۴ ساعت</dt>
              <dd>
                {discovery.uniqueVisitors24h?.toLocaleString("fa-IR") ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">پوشش ۲۴ ساعت</dt>
              <dd>
                {discovery.visitors24hCoverageSeconds == null
                  ? "—"
                  : `${Math.min(100, Math.round((discovery.visitors24hCoverageSeconds / 86_400) * 100)).toLocaleString("fa-IR")}٪`}
              </dd>
            </div>
          </dl>
          <div className="px-4" role="status" aria-live="polite">
            {command && (
              <p className="text-sm text-muted-foreground">
                وضعیت فرمان: {command.status}
              </p>
            )}
            {message && (
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={refresh}
              disabled={
                pending || (command ? !TERMINAL.has(command.status) : false)
              }
            >
              <RefreshCw
                className={pending ? "size-4 animate-spin" : "size-4"}
                aria-hidden="true"
              />
              {pending ? "در حال پیگیری…" : "تازه‌سازی پشته"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
