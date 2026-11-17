import { mkdir, readFile, writeFile } from "node:fs/promises";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

const worker = `
const HTML = ${JSON.stringify(html)};
const API_URL = "https://finance.naver.com/api/sise/etfItemList.nhn";

function response(body, type, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": type,
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      ...extra,
    },
  });
}

async function fetchEtfs() {
  const upstream = await fetch(API_URL, {
    headers: { "accept": "application/json,text/plain,*/*" },
    cf: { cacheTtl: 30, cacheEverything: true },
  });
  if (!upstream.ok) {
    return response(JSON.stringify({ error: "NAVER_UPSTREAM_ERROR", status: upstream.status }), "application/json; charset=utf-8", 502);
  }
  const bytes = await upstream.arrayBuffer();
  const text = new TextDecoder("euc-kr").decode(bytes);
  try {
    const payload = JSON.parse(text);
    const items = payload?.result?.etfItemList;
    if (!Array.isArray(items)) throw new Error("Unexpected response shape");
    return response(
      JSON.stringify({ items, fetchedAt: new Date().toISOString(), source: API_URL }),
      "application/json; charset=utf-8",
      200,
      { "cache-control": "public, max-age=20, stale-while-revalidate=40" },
    );
  } catch {
    return response(JSON.stringify({ error: "NAVER_RESPONSE_PARSE_ERROR" }), "application/json; charset=utf-8", 502);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/etfs") return fetchEtfs();
    if (url.pathname === "/" || url.pathname === "/index.html") return response(HTML, "text/html; charset=utf-8");
    if (url.pathname === "/health") return response(JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    return response("Not found", "text/plain; charset=utf-8", 404);
  },
};
`;

await mkdir(new URL("./dist/server/", import.meta.url), { recursive: true });
await writeFile(new URL("./dist/server/index.js", import.meta.url), worker.trimStart(), "utf8");
console.log("Built dist/server/index.js");

