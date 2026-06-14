# ══════════════════════════════════════════════════════════════════
#  VaultBox — NSIS Custom Installer Script
#  Datei: build/installer.nsh
#  Sprachen: Deutsch · Englisch
# ══════════════════════════════════════════════════════════════════

# ── Begrüßungsseite ──────────────────────────────────────────────
!macro customWelcomePage
  # Willkommenstext auf der ersten Seite
  !define MUI_WELCOMEPAGE_TITLE "Willkommen bei VaultBox"
  !define MUI_WELCOMEPAGE_TEXT "Dieses Programm installiert VaultBox v${VERSION} auf Ihrem Computer.$\r$\n$\r$\nVaultBox ist eine vollständig offline arbeitende Finanzverwaltung.$\r$\nKeine Cloud. Kein Login. Alle Daten bleiben auf Ihrem Gerät.$\r$\n$\r$\nBereits installiert? Diesen Installer erneut ausführen repariert die Programmdateien (Ihre Daten bleiben erhalten).$\r$\n$\r$\nKlicken Sie auf Weiter, um zu beginnen."
!macroend

# ── Vor der Installation ──────────────────────────────────────────
!macro customInstallMode
  # Standard: per-user Installation (kein Admin nötig)
  SetShellVarContext current
!macroend

# ── Nach der Installation ─────────────────────────────────────────
!macro customInstall
  # Dateiverknüpfung .fbs → App
  WriteRegStr HKCU "Software\Classes\.fbs"              "" "VaultBox.Document"
  WriteRegStr HKCU "Software\Classes\.fbs"              "Content Type" "application/json"
  WriteRegStr HKCU "Software\Classes\VaultBox.Document" "" "VaultBox Snapshot"
  WriteRegStr HKCU "Software\Classes\VaultBox.Document\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Classes\VaultBox.Document\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  # Alte Candlescope-Verknüpfung aufräumen (Rebrand)
  DeleteRegKey HKCU "Software\Classes\CandlescopeFinanceBoard.Document"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\CandlescopeFinanceBoard.exe"

  # App-Infos in Windows-Systemsteuerung
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\VaultBox.exe" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\VaultBox.exe" "Path" "$INSTDIR"

  # Erfolgsmeldung
  DetailPrint "✓ VaultBox wurde erfolgreich installiert."
  DetailPrint "✓ .fbs-Dateien wurden registriert."
!macroend

# ── Beim Deinstallieren ───────────────────────────────────────────
!macro customUnInstall
  # Dateiverknüpfungen entfernen
  DeleteRegKey HKCU "Software\Classes\.fbs"
  DeleteRegKey HKCU "Software\Classes\VaultBox.Document"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\VaultBox.exe"

  # Benutzerdaten NICHT löschen (localStorage liegt im AppData-Profil)
  DetailPrint "Hinweis: Ihre gespeicherten Finanzdaten in AppData wurden NICHT gelöscht."
  DetailPrint "Sie finden sie unter: $APPDATA\VaultBox\"
!macroend
