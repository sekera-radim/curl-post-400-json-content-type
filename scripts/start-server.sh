#!/bin/bash
# Start the JSON task API in the background and wait until it answers.
node ~/app/server.js >/tmp/server.log 2>&1 &
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000/health; then
    exit 0
  fi
  sleep 0.2
done
echo "server did not start" >&2
cat /tmp/server.log >&2
exit 1
