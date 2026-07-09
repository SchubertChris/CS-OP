// ══════════════════════════════════════
//  VaultBox — Abo-Lizenz signieren / ausstellen
// ══════════════════════════════════════
//
//  Signiert eine Abo-Lizenz mit deinem PRIVATEN Schlüssel. Dieses Skript läuft
//  NUR bei dir (bzw. auf deinem Lizenz-Server) — niemals in der ausgelieferten App.
//
//  Aufruf:
//    node tools/issue-license.js <machineId> <tageGültig> <email> [tier] [licenseId]
//
//  • <machineId>   Geräte-ID des Käufers (zeigt die App unter "Geräte-ID" an;
//                  IPC license:machineId). "any" = nicht an ein Gerät gebunden.
//  • <tageGültig>  Abo-Laufzeit in Tagen ab jetzt (z.B. 31). "owner" = kein Ablauf.
//  • <email>       Käufer-E-Mail (Anzeige + Zuordnung).
//  • [tier]        "subscription" (Standard) oder "owner".
//  • [licenseId]   optionale ID für deine Buchhaltung/Sperrliste (Default: random).
//
//  Beispiele:
//    node tools/issue-license.js 3f9a…  31  kunde@mail.de
//    node tools/issue-license.js any    owner  chris@vaultbox.app  owner
//
//  Ausgabe: der Inhalt der license.json (payload + signature). An den Käufer geben
//  oder vom Erneuerungs-Endpoint zurückliefern.

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PRIV_PATH = path.join(os.homedir(), "vaultbox-license-private.pem");

function fail(msg) { console.error("\n⛔ " + msg + "\n"); process.exit(1); }

if (!fs.existsSync(PRIV_PATH))
  fail("Privater Schlüssel nicht gefunden: " + PRIV_PATH + "\n   Erst `node tools/gen-license-keys.js` ausführen.");

const [, , machineIdArg, durationArg, email, tierArg, licenseIdArg] = process.argv;
if (!machineIdArg || !durationArg || !email)
  fail("Aufruf: node tools/issue-license.js <machineId|any> <tageGültig|owner> <email> [tier] [licenseId]");

const dur = String(durationArg).toLowerCase();
const tierLc = String(tierArg || "").toLowerCase();
// Kein Ablauf: Perpetual (Einmalkauf) oder Owner (deine Kopie).
const noExpiry = dur === "owner" || dur === "perpetual" || tierLc === "owner" || tierLc === "perpetual";
const tier = noExpiry
  ? (dur === "owner" || tierLc === "owner" ? "owner" : "perpetual")
  : (tierArg || "sub");

let validUntil = null;
if (!noExpiry) {
  const days = parseInt(durationArg, 10);
  if (!Number.isFinite(days) || days <= 0) fail("<tageGültig> muss eine positive Zahl sein (oder 'perpetual'/'owner').");
  validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

// payload wird als EXAKTER String signiert UND so gespeichert — die App prüft
// die Signatur über genau diese Bytes (keine Re-Serialisierung → robust).
const payloadObj = {
  machineId: machineIdArg === "any" ? null : machineIdArg,
  validUntil,
  email,
  tier,
  licenseId: licenseIdArg || crypto.randomBytes(8).toString("hex"),
  issuedAt: new Date().toISOString(),
};
const payload = JSON.stringify(payloadObj);

const privKey = crypto.createPrivateKey(fs.readFileSync(PRIV_PATH));
const signature = crypto.sign(null, Buffer.from(payload, "utf8"), privKey).toString("base64");

const license = { payload, signature };

console.log("\n✅ Lizenz signiert (" + tier + (validUntil ? ", gültig bis " + validUntil : ", unbefristet") + "):\n");
console.log(JSON.stringify(license, null, 2));
console.log("\n→ Diesen Inhalt als license.json an den Käufer geben bzw. über den Renew-Endpoint zurückliefern.\n");
