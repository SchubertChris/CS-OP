// Dev-Screenshot-Tool: koppelt an die laufende Electron-App (Remote-Debugging-
// Port) und macht einen Screenshot des Renderers. Optional vorher JS ausführen,
// um zu einem bestimmten Screen zu navigieren.
//
//   node tools/devshot.js <ausgabe.png> ["<optionales JS im Renderer>"]
//
// Voraussetzung: App läuft mit  --remote-debugging-port=9222
//   z.B.:  unset ELECTRON_RUN_AS_NODE; npx electron . --remote-debugging-port=9222
//
// Nutzt nur Node-Bordmittel (global fetch + global WebSocket, Node 22+).

const fs = require("fs");
const outPath = process.argv[2] || "devshot.png";
const evalJs = process.argv[3] || null;
const PORT = process.env.CDP_PORT || 9222;

async function getPage() {
  for (let i = 0; i < 40; i++) { // bis ~20s auf den App-Start warten
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const p = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

(async () => {
  const page = await getPage();
  if (!page) { console.error("❌ Keine laufende App auf Port " + PORT + " gefunden."); process.exit(1); }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params) =>
    new Promise((res) => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });

  ws.onmessage = (e) => {
    const m = JSON.parse(typeof e.data === "string" ? e.data : e.data.toString());
    if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; }
  };
  ws.onerror = (e) => { console.error("❌ WS-Fehler:", (e && e.message) || e); process.exit(1); };
  ws.onopen = async () => {
    try {
      await send("Page.enable");
      await send("Runtime.enable");
      if (evalJs) {
        await send("Runtime.evaluate", { expression: evalJs, awaitPromise: true });
        await new Promise((r) => setTimeout(r, 700)); // kurz auf Render/Animation warten
      }
      const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      if (!shot || !shot.data) { console.error("❌ Kein Bild erhalten."); process.exit(1); }
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      console.log("✅ Screenshot:", outPath, "(" + fs.statSync(outPath).size + " Bytes)");
      ws.close();
      process.exit(0);
    } catch (err) { console.error("❌", err.message); process.exit(1); }
  };

  setTimeout(() => { console.error("❌ Timeout."); process.exit(1); }, 30000);
})().catch((e) => { console.error(e); process.exit(1); });
