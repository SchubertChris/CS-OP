// ══════════════════════════════════════
//  VaultBox — Lizenz-Schlüsselpaar erzeugen (EINMALIG)
// ══════════════════════════════════════
//
//  Erzeugt ein Ed25519-Schlüsselpaar für die Lizenz-Signierung.
//
//    node tools/gen-license-keys.js
//
//  • PRIVATER Schlüssel  → wird in deinem Home-Verzeichnis gespeichert.
//    NIEMALS committen, niemals weitergeben, niemals ins Repo legen!
//    Er signiert deine Lizenzen. Wer ihn hat, kann beliebige Lizenzen fälschen.
//  • ÖFFENTLICHER Schlüssel → wird ausgegeben. Diesen Block in main.js bei
//    LICENSE_PUBLIC_KEY_PEM einsetzen. Er kann nur PRÜFEN, nie fälschen → safe.
//
//  Tipp: bewahre den privaten Schlüssel zusätzlich offline auf (Passwort-Manager).
//        Geht er verloren, kannst du keine neuen/erneuerten Lizenzen mehr ausstellen.

const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const pubPem = publicKey.export({ type: "spki", format: "pem" }).toString();
const privPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

const privPath = path.join(os.homedir(), "vaultbox-license-private.pem");
if (fs.existsSync(privPath)) {
  console.error("\n⛔ ABBRUCH: " + privPath + " existiert bereits.");
  console.error("   Überschreiben würde alle bestehenden Lizenzen ungültig machen.");
  console.error("   Lösche/verschiebe die Datei bewusst, falls du wirklich neu erzeugen willst.\n");
  process.exit(1);
}

fs.writeFileSync(privPath, privPem, { mode: 0o600 });

console.log("\n✅ Schlüsselpaar erzeugt.\n");
console.log("🔐 PRIVATER Schlüssel gespeichert unter (GEHEIM HALTEN!):");
console.log("   " + privPath + "\n");
console.log("📋 ÖFFENTLICHEN Schlüssel jetzt in main.js bei LICENSE_PUBLIC_KEY_PEM einsetzen:\n");
console.log(pubPem);
