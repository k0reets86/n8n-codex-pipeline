#!/usr/bin/env bash
set -euo pipefail
URL="${1:-}"
if [ -z "$URL" ]; then
  echo "Usage: smoke_test.sh <WEBHOOK_URL>"; exit 1; fi

echo "[SMOKE] POST $URL"
code=$(curl --retry 3 --retry-delay 2 -sS -o /tmp/smoke_resp.json -w "%{http_code}" -X POST "$URL"   -H 'Content-Type: application/json'   --data '{"probe":"ci"}')

cat /tmp/smoke_resp.json || true
if [[ "$code" != 2* ]]; then
  echo "[SMOKE] Non-2xx response: $code"; exit 2; fi

echo "[SMOKE] OK ($code)"
