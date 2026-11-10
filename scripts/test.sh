#!/bin/bash
fail() { echo "FAIL: $1"; exit 1; }
cd ~
bash scripts/start-server.sh || fail "server did not start"
BASE=http://localhost:3000

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST -d '{"title":"demo"}' "$BASE/tasks")
[ "$CODE" = "400" ] || fail "curl -d without a header should get 400, got $CODE"
echo "ok 1 - curl -d without a header gets 400: the body is ignored"

ID=$(curl -s --json '{"title":"demo"}' "$BASE/tasks" | jq -r .id)
[ -n "$ID" ] && [ "$ID" != "null" ] || fail "curl --json should create a task with an id"
echo "ok 2 - curl --json (or -H Content-Type) creates the task"

SUMMARY=$(curl -s --json '{"summary":"done"}' "$BASE/tasks/$ID/complete" | jq -r .result.summary)
[ "$SUMMARY" = "done" ] || fail "complete should return .result.summary, got $SUMMARY"
echo "ok 3 - the walkthrough reads fields the API really returns (.id, .result.summary)"

node scripts/check-docs-examples.mjs >/tmp/docs.log 2>&1 || fail "README examples no longer match the live API"
grep -q "ALL PASSED" /tmp/docs.log || fail "docs check did not pass"
echo "ok 4 - the README's own curl examples still pass against the live server"

echo "ALL PASSED"
