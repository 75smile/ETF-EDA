import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = Number(process.env.PORT || 4173);
const API_URL = "https://finance.naver.com/api/sise/etfItemList.nhn";
const assets = new Map([
  ["/", ["../index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["../index.html", "text/html; charset=utf-8"]],
]);

function send(res, status, type, body) {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/etfs")) {
      const upstream = await fetch(API_URL);
      if (!upstream.ok) throw new Error(`NAVER API ${upstream.status}`);
      const bytes = await upstream.arrayBuffer();
      const text = new TextDecoder("euc-kr").decode(bytes);
      const payload = JSON.parse(text);
      send(res, 200, "application/json; charset=utf-8", JSON.stringify({
        items: payload.result.etfItemList,
        fetchedAt: new Date().toISOString(),
        source: API_URL,
      }));
      return;
    }
    const asset = assets.get(req.url || "/");
    if (!asset) return send(res, 404, "text/plain; charset=utf-8", "Not found");
    const body = await readFile(new URL(asset[0], import.meta.url));
    send(res, 200, asset[1], body);
  } catch (error) {
    send(res, 502, "application/json; charset=utf-8", JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Local: http://127.0.0.1:${PORT}`);
});

