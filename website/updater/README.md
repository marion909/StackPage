# StackPage Auto-Updater — Server-Setup

Der Tauri-Updater erwartet per GET-Request auf:

```
https://stackpage.at/updates/{target}/{arch}/{current_version}
```

Beispiel: `https://stackpage.at/updates/windows/x86_64/0.1.0`

## Server-Response

Wenn ein Update verfügbar ist → **HTTP 200** + JSON:

```json
{
  "version": "0.2.0",
  "notes": "Neue Features und Bugfixes",
  "pub_date": "2026-03-28T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<INHALT_DER_.sig_DATEI>",
      "url": "https://stackpage.at/updates/download/0.2.0/stackpage_0.2.0_x64-setup.exe"
    }
  }
}
```

Wenn **kein** Update verfügbar → **HTTP 204** (kein Body).

## Release-Build erstellen

```powershell
# Umgebungsvariablen setzen (z.B. in CI)
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content .tauri-key -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "stackpage-updater"

pnpm tauri build
```

Der Build erstellt:
- `src-tauri/target/release/bundle/nsis/stackpage_X.X.X_x64-setup.exe`  ← Installer
- `src-tauri/target/release/bundle/nsis/stackpage_X.X.X_x64-setup.exe.sig`  ← Signatur

## Deployment-Checklist

1. `tauri.conf.json` → `version` erhöhen
2. `pnpm tauri build` ausführen (mit TAURI_SIGNING_* gesetzt)
3. Installer + .sig Datei auf den Server hochladen
4. JSON-Response des Update-Servers aktualisieren (neue Version + Signatur)
5. Alten Clients wird beim nächsten Start das Update-Banner angezeigt

## Private Key sichern

Der private Schlüssel liegt in `.tauri-key` (in .gitignore!).
**Passwort:** `stackpage-updater` — bitte in einem Passwortmanager speichern.

Für CI/CD: Private Key als Secret hinterlegen:
- GitHub Actions: Repository Settings → Secrets → `TAURI_SIGNING_PRIVATE_KEY`
