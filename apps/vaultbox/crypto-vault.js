// ══════════════════════════════════════
//  crypto-vault.js — Zero-Knowledge Verschlüsselung (NUR Main-Prozess!)
// ══════════════════════════════════════
//
//  Niemals aus dem Renderer require()-n. Der DEK (Datenschlüssel) lebt
//  ausschließlich hier im Main-Prozess-RAM — so kann ein XSS im Renderer ihn
//  nicht extrahieren und eine gestohlene Datei nicht offline entschlüsseln.
//
//  Verfahren (Envelope-Verschlüsselung):
//    Passwort --Argon2id(salt)--> KEK --entschlüsselt--> DEK --AES-256-GCM--> Daten
//  Auf der Platte liegen NUR: salt, KDF-Parameter, verschlüsselter DEK, IVs, Tags.
//  Der Header (v/kdf/wrap) wird als AAD in den Daten-Tag eingerechnet → ein
//  Downgrade/Tausch des Headers macht die Entschlüsselung ungültig (Anti-Rollback).
//
//  Argon2id wird genutzt wenn das native Modul `argon2` installiert ist, sonst
//  Fallback auf Node-eigenes scrypt (ohne neue Dependency, lauffähig + testbar).

const crypto = require("crypto");

let argon2 = null;
try { argon2 = require("argon2"); } catch (_) { /* Fallback scrypt */ }

const KDF_ARGON = { alg: "argon2id", mem: 65536, time: 3, parallelism: 1 }; // 64 MiB
const KDF_SCRYPT = { alg: "scrypt", N: 1 << 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

const b64e = (b) => Buffer.from(b).toString("base64");
const b64d = (s) => Buffer.from(s, "base64");

function pickKdf() { return argon2 ? { ...KDF_ARGON } : { ...KDF_SCRYPT }; }

// Passwort (+ Salt) → 32-Byte Key-Encryption-Key. Langsam + speicher-hart,
// damit Offline-Rateversuche an einer gestohlenen Datei real Geld kosten.
async function deriveKEK(password, saltBuf, kdf) {
  if (kdf.alg === "argon2id") {
    if (!argon2) throw new Error("Datei ist argon2id-verschlüsselt, aber das Modul fehlt.");
    return argon2.hash(password, {
      type: argon2.argon2id, raw: true, salt: saltBuf,
      memoryCost: kdf.mem, timeCost: kdf.time, parallelism: kdf.parallelism, hashLength: 32,
    });
  }
  if (kdf.alg === "scrypt") {
    return crypto.scryptSync(password, saltBuf, 32, { N: kdf.N, r: kdf.r, p: kdf.p, maxmem: kdf.maxmem });
  }
  throw new Error("Unbekannte KDF: " + kdf.alg);
}

// AES-256-GCM. Tag wird ans Ciphertext angehängt (WebCrypto-kompatibel).
// aadBuf bindet den (unverschlüsselten) Header an den Tag.
function gcmEncrypt(key, plaintextBuf, aadBuf) {
  const iv = crypto.randomBytes(12); // FRISCH pro Aufruf — niemals wiederverwenden
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  if (aadBuf) c.setAAD(aadBuf);
  const ct = Buffer.concat([c.update(plaintextBuf), c.final()]);
  return { iv, ct: Buffer.concat([ct, c.getAuthTag()]) };
}
function gcmDecrypt(key, iv, ctWithTag, aadBuf) {
  const ct = ctWithTag.subarray(0, ctWithTag.length - 16);
  const tag = ctWithTag.subarray(ctWithTag.length - 16);
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  if (aadBuf) d.setAAD(aadBuf);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]); // wirft bei falschem Schlüssel/Tag/AAD
}

// AAD = die zu schützenden Header-Felder, deterministisch serialisiert.
// In seal UND open identisch berechnet → Manipulation am Header bricht den Tag.
function aadOf(env) {
  return Buffer.from(JSON.stringify({ v: env.v, kdf: env.kdf, wrap: env.wrap }), "utf8");
}

// Einmaliger Recovery-Code (Notfall-Schlüssel zum Aufschreiben).
// 25 Zeichen aus einem 32er-Alphabet ohne Verwechsler (0/O/1/I) ≈ 125 Bit.
// 256 % 32 === 0 → keine Modulo-Verzerrung.
function makeRecoveryCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.randomBytes(25);
  let s = "";
  for (let i = 0; i < 25; i++) s += A[b[i] % 32];
  return s.match(/.{1,5}/g).join("-");
}

// Normalisiert den Recovery-Code → tolerant gegen Bindestriche/Leerzeichen/Groß-Klein.
function _normRecovery(code) { return String(code || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase(); }

// Wickelt den DEK zusätzlich unter einem Schlüssel ein, der aus `secret`
// (Passwort ODER Recovery-Code) abgeleitet wird. Gibt einen Slot zurück.
async function _wrapSlot(secret, dek) {
  const kdf = pickKdf();
  const salt = crypto.randomBytes(16);
  const kek = await deriveKEK(secret, salt, kdf);
  const wrap = gcmEncrypt(kek, dek, null);
  return { kdf: { ...kdf, salt: b64e(salt) }, wrap: { alg: "AES-256-GCM", iv: b64e(wrap.iv), ct: b64e(wrap.ct) } };
}

// Öffnet den DEK aus einem Slot (Passwort/Recovery). null bei falschem Secret.
async function _unwrapSlot(slot, secret) {
  const kek = await deriveKEK(secret, b64d(slot.kdf.salt), slot.kdf);
  try { return gcmDecrypt(kek, b64d(slot.wrap.iv), b64d(slot.wrap.ct), null); }
  catch (_) { return null; }
}

// Neuen Vault anlegen (Erstinstallation / Passwort setzen).
// Erzeugt zusätzlich einen Recovery-Slot + gibt den Recovery-Code zurück
// (muss EINMALIG dem Nutzer angezeigt und von ihm notiert werden).
async function createVault(password, plaintextStr) {
  const dek = crypto.randomBytes(32); // echter Datenschlüssel — zufällig, NIE aus dem Passwort
  const pwSlot = await _wrapSlot(password, dek);
  const recoveryCode = makeRecoveryCode();
  const recSlot = await _wrapSlot(_normRecovery(recoveryCode), dek);
  const env = {
    vaultbox: true, v: 2, kind: "vault",
    kdf: pwSlot.kdf,
    wrap: pwSlot.wrap,
    recovery: recSlot,
    data: null,
  };
  env.data = _sealRaw(env, dek, plaintextStr);
  return { envelope: env, dek, recoveryCode };
}

// Entsperren per RECOVERY-CODE (Passwort vergessen). null bei falschem Code.
async function unlockWithRecovery(envelope, recoveryCode) {
  if (!envelope.recovery) return null;
  const dek = await _unwrapSlot(envelope.recovery, _normRecovery(recoveryCode));
  if (!dek) return null;
  try {
    const plaintext = gcmDecrypt(dek, b64d(envelope.data.iv), b64d(envelope.data.ct), aadOf(envelope));
    return { dek, plaintext: plaintext.toString("utf8") };
  } catch (_) { return null; }
}

function _sealRaw(env, dek, plaintextStr) {
  const enc = gcmEncrypt(dek, Buffer.from(plaintextStr, "utf8"), aadOf(env));
  return { alg: "AES-256-GCM", iv: b64e(enc.iv), ct: b64e(enc.ct) };
}

// Entsperren: Passwort → DEK + Klartext. null bei falschem Passwort.
async function unlockVault(envelope, password) {
  const kek = await deriveKEK(password, b64d(envelope.kdf.salt), envelope.kdf);
  let dek;
  try {
    dek = gcmDecrypt(kek, b64d(envelope.wrap.iv), b64d(envelope.wrap.ct), null);
  } catch (_) {
    return null; // Passwort falsch (wrap-Tag schlägt fehl)
  }
  let plaintext;
  try {
    plaintext = gcmDecrypt(dek, b64d(envelope.data.iv), b64d(envelope.data.ct), aadOf(envelope));
  } catch (_) {
    return null; // Daten- oder Header-Manipulation
  }
  return { dek, plaintext: plaintext.toString("utf8") };
}

// Daten neu verschlüsseln mit bereits entsperrtem DEK (jeder Speichervorgang).
// Header (kdf/wrap) bleibt unverändert → AAD stabil.
function sealData(envelope, dek, plaintextStr) {
  return { ...envelope, data: _sealRaw(envelope, dek, plaintextStr) };
}

// Aktuelle Daten mit bereits entsperrtem DEK entschlüsseln (kein KDF nötig → schnell).
function openData(envelope, dek) {
  return gcmDecrypt(dek, b64d(envelope.data.iv), b64d(envelope.data.ct), aadOf(envelope)).toString("utf8");
}

// Mit dem DEK direkt eine beliebige Nutzlast verschlüsseln/entschlüsseln
// (für Safepoints — eigenständige Container, an denselben DEK gebunden).
function encryptWithDek(dek, plaintextStr) {
  const enc = gcmEncrypt(dek, Buffer.from(plaintextStr, "utf8"), null);
  return { vaultbox: true, enc: true, alg: "AES-256-GCM", iv: b64e(enc.iv), ct: b64e(enc.ct) };
}
function decryptWithDek(dek, container) {
  return gcmDecrypt(dek, b64d(container.iv), b64d(container.ct), null).toString("utf8");
}

// Passwort ändern: DEN GLEICHEN DEK unter neuem KEK neu einwickeln (O(1),
// kein Neu-Verschlüsseln der Daten). Daten mit neuem AAD neu versiegeln.
async function rewrapDEK(envelope, dek, newPassword, currentPlaintextStr) {
  const kdf = pickKdf();
  const salt = crypto.randomBytes(16);
  const kek = await deriveKEK(newPassword, salt, kdf);
  const wrap = gcmEncrypt(kek, dek, null);
  const env = {
    ...envelope,
    kdf: { ...kdf, salt: b64e(salt) },
    wrap: { alg: "AES-256-GCM", iv: b64e(wrap.iv), ct: b64e(wrap.ct) },
  };
  env.data = _sealRaw(env, dek, currentPlaintextStr);
  return env;
}

// Stabiler SQLCipher-Raw-Key aus dem DEK (eigener Subkey ≠ Datei-DEK).
function dbKeyFromDek(dek, label) {
  return crypto.createHmac("sha256", dek).update(label || "db").digest("hex");
}

module.exports = {
  createVault, unlockVault, unlockWithRecovery, makeRecoveryCode,
  sealData, openData, rewrapDEK,
  encryptWithDek, decryptWithDek, dbKeyFromDek,
  isArgonAvailable: () => !!argon2,
};
