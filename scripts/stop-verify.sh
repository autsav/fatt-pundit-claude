#!/usr/bin/env bash
# Stop hook: if src/ has changes, run verify.sh. On failure, block the stop
# (exit 2) and send only the failing lines to Claude. Silent when src/ is clean.
set -u
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"
# Astro needs Node >= 22.23.4; the system Node is older, so prefer Homebrew's when present.
[ -x /opt/homebrew/bin/node ] && PATH="/opt/homebrew/bin:$PATH"

input="$(cat)"

changed="$(git diff --name-only HEAD -- src; git ls-files --others --exclude-standard -- src)"
[ -z "$changed" ] && exit 0

out="$(bash scripts/verify.sh 2>&1)" && exit 0

# Already blocked once this chain: report but let the turn end, to avoid a loop.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  printf '%s\n' "$out" | grep -v '^ok ' >&2
  exit 0
fi

printf '%s\n' "$out" | grep -v '^ok ' >&2
exit 2
