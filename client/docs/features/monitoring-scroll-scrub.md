# Monitoring scroll-scrub film

> **Status:** Draft
>
> **Route:** `/[locale]/monitoring`
>
> **Last verified:** 2026-08-28

Cinematic public page for Unixsee 24/7 monitoring. The video **does not play**; scroll maps to `video.currentTime` on a paused all-intra MP4.

## Files

| Path | Role |
|---|---|
| `src/app/[locale]/(website)/monitoring/page.tsx` | Page composition |
| `src/components/monitoring/scroll-scrub-stage.tsx` | Sticky stage + captions |
| `src/hooks/use-scroll-scrub.ts` | Scroll → currentTime engine |
| `src/lib/monitoring/beats.ts` | Caption beat timings |
| `public/videos/watch-scrub.mp4` | Scrub asset (replace with Gemini stitch) |
| `scripts/encode-scrub.sh` | GOP-1 ffmpeg encode |

## Encode replacement video

From `client/`:

```bash
./scripts/encode-scrub.sh path/to/gemini-stitch.mp4 public/videos/watch-scrub.mp4
```

Requires `-g 1 -bf 0` for instant bidirectional seek.

## Product context

Phase 1 monitoring signals: availability, backup recency, storage, WooCommerce checkout health, agent heartbeat freshness. Stale telemetry must never display as healthy.
