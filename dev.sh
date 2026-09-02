#!/usr/bin/env bash
# Start frontend (Vite) + backend (Go) and stream both logs with prefixes.
# Usage: ./dev.sh   (Ctrl+C stops both)

set -eu

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

PIDS=()

cleanup() {
  echo -e "\n[dev] Shutting down..."
  for pid in "${PIDS[@]:-}"; do
    # Kill the whole process group (go run spawns a child binary)
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  exit 0
}
trap cleanup INT TERM

run_tagged() {
  local tag="$1"; shift
  "$@" 2>&1 | sed -u "s/^/[$tag] /"
}

echo "[backend] Starting on http://localhost:8080"
cd "$BACKEND_DIR"
setsid bash -c 'exec go run cmd/server/main.go' &
PIDS+=($!)

echo "[frontend] Starting on http://localhost:3000"
cd "$FRONTEND_DIR"
[ -d node_modules ] || npm install
setsid bash -c 'exec npm run dev' &
PIDS+=($!)

echo "[dev] Press Ctrl+C to stop both servers."
wait
