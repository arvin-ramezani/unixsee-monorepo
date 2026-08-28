#!/usr/bin/env bash
# Encode a Gemini/Veo clip for scroll-scrub via video.currentTime.
# All-intra H.264 (GOP 1, no B-frames) so seeking any frame is instant.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/encode-scrub.sh input.mp4 [output.mp4]" >&2
  exit 1
fi

INPUT="$1"
OUTPUT="${2:-public/videos/watch-scrub.mp4}"

mkdir -p "$(dirname "$OUTPUT")"

ffmpeg -y -i "$INPUT" \
  -an \
  -c:v libx264 -preset slow -crf 18 \
  -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUTPUT"

echo "Wrote $OUTPUT"
echo "Drop this file over public/videos/watch-scrub.mp4 and keep the same filename."
