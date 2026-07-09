// Dev-Eval: führt JS in der laufenden App (Debug-Port) aus und gibt das Ergebnis
// als Text zurück (zum Debuggen). node tools/deveval.js "<JS-Ausdruck>"
const evalJs = process.argv[2];
const PORT = process.env.CDP_PORT || 9222;

async function getPage() {
  for (let i = 0; i < 40; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const p = l.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

(async () => {
  const page = await getPage();
  if (!page) { console.error("❌ keine App auf Port " + PORT); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = {};
  const send = (m, p) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = (e) => { const m = JSON.parse(typeof e.data === "string" ? e.data : e.data.toString()); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } };
  ws.onerror = (e) => { console.error("ws err", (e && e.message) || e); process.exit(1); };
  ws.onopen = async () => {
    await send("Runtime.enable");
    const r = await send("Runtime.evaluate", { expression: evalJs, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      console.log("EXCEPTION: " + JSON.stringify((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text || r.exceptionDetails));
    } else {
      const v = r.result.value;
      console.log(typeof v === "object" ? JSON.stringify(v, null, 1) : String(v));
    }
    ws.close(); process.exit(0);
  };
  setTimeout(() => { console.error("timeout"); process.exit(1); }, 30000);
})().catch((e) => { console.error(e); process.exit(1); });
