# curl examples for a JSON task API

A minimal JSON API over plain `node:http`. Like most JSON frameworks it parses a request body only when
`Content-Type: application/json` is set. Any other body is ignored, so the
request fails validation with a 400 even though the JSON looks valid.

    docker build -t curl-json-demo .
    docker run --rm curl-json-demo

## Create a task

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"title":"demo"}' http://localhost:3000/tasks | jq -e .id
```

## Create a task and mark it done

```bash
ID=$(curl -s --json '{"title":"demo"}' http://localhost:3000/tasks | jq -r .id)
curl -s --json '{"summary":"done"}' "http://localhost:3000/tasks/$ID/complete" | jq -e .result.summary
```
