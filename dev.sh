#!/usr/bin/env bash
# Start frontend (Vite) + backend (Go) and stream both logs with prefixes.
# Reclaims its ports before starting, so stale processes can't block it.
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

# free_port <port> - kill whatever currently holds the port (stale go run
# children, leftover vite, another dev.sh instance) and wait until it's free.
free_port() {
  local port="$1"
  local holder pids=""
  pids=$(ss -tlnp 2>/dev/null | grep -P ":$port " | grep -oP 'pid=\K[0-9]+' | sort -u | tr '\n' ' ')
  for holder in $pids; do
    echo "[dev] Port $port held by pid $holder, stopping it..."
    kill -- -"$holder" 2>/dev/null || kill "$holder" 2>/dev/null || true
  done
  for _ in $(seq 1 20); do
    if ! ss -tln 2>/dev/null | grep -qP ":$port "; then
      return 0
    fi
    sleep 0.5
  done
  echo "[dev] WARNING: port $port still in use" >&2
}

echo "[dev] Reclaiming ports..."
free_port 8080
free_port 3000

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