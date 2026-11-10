#!/usr/bin/env node
// Minimal JSON task API: plain node:http, no framework, no dependencies.
// It only parses a request body when Content-Type is application/json.
const http = require("http");

const tasks = new Map();
let nextId = 1;

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const contentType = (req.headers["content-type"] || "").split(";")[0].trim();

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && req.url === "/tasks") {
    if (contentType !== "application/json") {
      return sendJson(res, 400, { error: "Content-Type must be application/json" });
    }
    const raw = await readBody(req);
    let body;
    try { body = JSON.parse(raw || "{}"); } catch { body = {}; }
    const id = String(nextId++);
    const task = { id, title: body.title || "untitled", status: "pending" };
    tasks.set(id, task);
    return sendJson(res, 201, task);
  }

  const m = req.url.match(/^\/tasks\/([^/]+)\/complete$/);
  if (req.method === "POST" && m) {
    if (contentType !== "application/json") {
      return sendJson(res, 400, { error: "Content-Type must be application/json" });
    }
    const task = tasks.get(m[1]);
    if (!task) return sendJson(res, 404, { error: "task not found" });
    const raw = await readBody(req);
    let body;
    try { body = JSON.parse(raw || "{}"); } catch { body = {}; }
    task.status = "done";
    task.result = { summary: body.summary || "" };
    return sendJson(res, 200, task);
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(3000, () => console.log("listening on 3000"));
