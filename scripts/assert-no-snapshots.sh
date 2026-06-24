#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

snapshot_count=$(find __tests__ -type f -name "*.snap" | wc -l | tr -d ' ')

if [[ "$snapshot_count" != "0" ]]; then
  echo "[QA Gate] Snapshot files detected: $snapshot_count"
  find __tests__ -type f -name "*.snap"
  echo "[QA Gate] Snapshot-based tests are disabled for critical regression suite."
  exit 1
fi

echo "[QA Gate] OK: no snapshot files detected in __tests__."
