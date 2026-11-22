#!/usr/bin/env bash
# All checks, one line each. On FAIL, prints only the last 30 lines of that step.
# Usage: npm run verify
set -u
cd "$(dirname "$0")/.."

log="$(mktemp)"
trap 'rm -f "$log"' EXIT
status=0

step() {
  local name="$1"; shift
  if "$@" >"$log" 2>&1; then
    echo "ok   $name"
  else
    echo "FAIL $name"
    tail -n 30 "$log"
    status=1
  fi
}

step "astro check"   npm run -s check
step "build"         npm run -s build
step "validate:data" npm run -s validate:data
step "test"          npm run -s test
step "test:contrast" npm run -s test:contrast

exit $status
