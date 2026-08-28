import { ScrollScrubStage } from "@/components/monitoring/scroll-scrub-stage";

const SIGNALS = [
  { fa: "در دسترس بودن و زمان پاسخ", en: "Availability and response" },
  { fa: "تازگی پشتیبان", en: "Backup recency" },
  { fa: "فضای دیسک و آستانه", en: "Storage and thresholds" },
  { fa: "سلامت تسویه ووکامرس", en: "WooCommerce checkout health" },
  { fa: "تازگی نبض ایجنت", en: "Agent heartbeat freshness" },
];

export default function MonitoringPage() {
  return (
    <main className="bg-[#11161E] text-[#F0F2F4]">
      <ScrollScrubStage />

      <section className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <p className="text-[11px] tracking-[0.28em] text-[#9FDCFF]/80 uppercase">
          Unixsee monitoring
        </p>
        <h1 className="mt-5 text-3xl font-medium leading-snug sm:text-5xl">
          عدد کهنه هرگز سالم نشان داده نمی‌شود.
        </h1>
        <p
          className="mt-4 max-w-xl font-[family-name:var(--font-geist-sans)] text-base leading-7 text-[#F0F2F4]/70"
          dir="ltr"
        >
          Stale telemetry never looks healthy. Unixsee watches WordPress and
          WooCommerce through the night so the store can open without an
          incident.
        </p>

        <ul className="mt-12 divide-y divide-[#F0F2F4]/10 border-y border-[#F0F2F4]/10">
          {SIGNALS.map((signal) => (
            <li
              key={signal.en}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span>{signal.fa}</span>
              <span
                className="font-[family-name:var(--font-geist-sans)] text-sm text-[#9FDCFF]/70"
                dir="ltr"
              >
                {signal.en}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href="#plan-request"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#F0F2F4] px-7 text-sm text-[#11161E] transition-colors hover:bg-[#9FDCFF]"
          >
            درخواست پلن
          </a>
          <p id="plan-request" className="text-sm text-[#F0F2F4]/55">
            ورودی عمومی فاز ۱: درخواست پلن، نه ثبت‌نام به‌تنهایی.
          </p>
        </div>
      </section>
    </main>
  );
}
