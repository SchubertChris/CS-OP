// ══════════════════════════════════════
//  PRELOAD — Sichere IPC-Brücke
// ══════════════════════════════════════

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("csf", {
  state: {
    load: () => ipcRenderer.invoke("state:load"),
    save: (data) => ipcRenderer.invoke("state:save", data),
  },

  settings: {
    load: () => ipcRenderer.invoke("settings:load"),
    save: (data) => ipcRenderer.invoke("settings:save", data),
  },

  archive: {
    list: (filter) => ipcRenderer.invoke("archive:list", filter),
    add: (refId, refType, refName, catId) =>
      ipcRenderer.invoke("archive:add", { refId, refType, refName, catId }),
    addBuffer: (refId, refType, refName, catId, file) =>
      ipcRenderer.invoke("archive:addBuffer", {
        refId,
        refType,
        refName,
        catId,
        file,
      }),
    getPath: (relPath) => ipcRenderer.invoke("archive:getPath", relPath),
    open: (relPath) => ipcRenderer.invoke("archive:open", relPath),
    openPath: (filePath) => ipcRenderer.invoke("archive:openPath", filePath),
    openFolder: (refType, refName) =>
      ipcRenderer.invoke("archive:openFolder", { refType, refName }),
    updateNote: (docId, note) =>
      ipcRenderer.invoke("archive:updateNote", { docId, note }),
    updateExpires: (docId, expires) =>
      ipcRenderer.invoke("archive:updateExpires", { docId, expires }),
    delete: (docId, relPath) =>
      ipcRenderer.invoke("archive:delete", { docId, relPath }),
    relinkDocs: (oldRefId, newRefId, refType, refName) =>
      ipcRenderer.invoke("archive:relinkDocs", {
        oldRefId,
        newRefId,
        refType,
        refName,
      }),
    linkDoc: (docId, refId, refType, refName) =>
      ipcRenderer.invoke("archive:linkDoc", { docId, refId, refType, refName }),
    openFolder: (opts) => ipcRenderer.invoke("archive:openFolder", opts || {}),
    renameDoc: (docId, newName) =>
      ipcRenderer.invoke("archive:renameDoc", { docId, newName }),
    size: () => ipcRenderer.invoke("archive:size"),
    clearAll: () => ipcRenderer.invoke("archive:clearAll"),
  },

  export: {
    full: (stateData, settingsData, includeArchive) =>
      ipcRenderer.invoke("export:full", {
        stateData,
        settingsData,
        includeArchive,
      }),
    fullAuto: (stateData, settingsData, filename) =>
      ipcRenderer.invoke("export:fullAuto", {
        stateData,
        settingsData,
        filename,
      }),
  },
  import: {
    full: () => ipcRenderer.invoke("import:full"),
  },

  safepoints: {
    list: () => ipcRenderer.invoke("safepoints:list"),
    save: (label, snapshot) =>
      ipcRenderer.invoke("safepoints:save", { label, snapshot }),
    load: (filename) => ipcRenderer.invoke("safepoints:load", filename),
    delete: (filename) => ipcRenderer.invoke("safepoints:delete", filename),
  },

  visionboard: {
    load: () => ipcRenderer.invoke("visionboard:load"),
    save: (data) => ipcRenderer.invoke("visionboard:save", data),
  },

  print: {
    page: (options) => ipcRenderer.invoke("print:page", options),
    html: (html)    => ipcRenderer.invoke("print:html", html),
  },

  storage: {
    getPath:    ()    => ipcRenderer.invoke("storage:getPath"),
    choosePath: ()    => ipcRenderer.invoke("storage:choosePath"),
    openFolder: ()    => ipcRenderer.invoke("storage:openFolder"),
    resetPath:  ()    => ipcRenderer.invoke("storage:resetPath"),
  },

  update: {
    check:   () => ipcRenderer.send("update:check"),
    install: () => ipcRenderer.send("update:install"),
    onChecking:     (cb) => ipcRenderer.on("update:checking",   ()     => cb()),
    onAvailable:    (cb) => ipcRenderer.on("update:available",  (_e, d) => cb(d)),
    onNotAvailable: (cb) => ipcRenderer.on("update:none",       (_e, d) => cb(d)),
    onProgress:     (cb) => ipcRenderer.on("update:progress",   (_e, d) => cb(d)),
    onDownloaded:   (cb) => ipcRenderer.on("update:downloaded", (_e, d) => cb(d)),
    onError:        (cb) => ipcRenderer.on("update:error",      (_e, d) => cb(d)),
  },

  license: {
    check:    ()    => ipcRenderer.invoke("license:check"),
    activate: (key) => ipcRenderer.invoke("license:activate", key),
    info:     ()    => ipcRenderer.invoke("license:info"),
  },

  pw: {
    hash:   (password)         => ipcRenderer.invoke("pw:hash", password),
    verify: (password, stored) => ipcRenderer.invoke("pw:verify", password, stored),
  },

  crypto: {
    addTx:     (tx)               => ipcRenderer.invoke("crypto:addTx", tx),
    deleteTx:  (id)               => ipcRenderer.invoke("crypto:deleteTx", id),
    getTxs:    (asset)            => ipcRenderer.invoke("crypto:getTxs", asset),
    getAssets: ()                 => ipcRenderer.invoke("crypto:getAssets"),
    getReport: (asset, year)      => ipcRenderer.invoke("crypto:getReport", asset, year),
    importCsv: (csv, mappings)    => ipcRenderer.invoke("crypto:importCsv", csv, mappings),
  },
});
