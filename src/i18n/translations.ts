// ─── Translation strings ──────────────────────────────────────────────────────

export const translations = {
  en: {
    // Dashboard
    "dashboard.title": "My Projects",
    "dashboard.newProject": "New Project",
    "dashboard.noProjects": "No projects yet",
    "dashboard.noProjectsHint": "Create your first website project to get started.",
    "dashboard.recent": "Recent",
    "dashboard.searchPlaceholder": "Search projects…",

    // Project card actions
    "project.open": "Open",
    "project.rename": "Rename",
    "project.duplicate": "Duplicate",
    "project.delete": "Delete",
    "project.updatedAt": "Updated",

    // Topbar
    "topbar.save": "Save",
    "topbar.saving": "Saving…",
    "topbar.export": "Export",
    "topbar.preview": "Preview",
    "topbar.theme": "Theme",
    "topbar.backToDashboard": "Back to Dashboard",

    // Sidebar
    "sidebar.components": "Components",
    "sidebar.pages": "Pages",
    "sidebar.properties": "Properties",
    "sidebar.addPage": "Add Page",
    "sidebar.importPage": "Import Page",
    "sidebar.addSection": "Add Section",
    "sidebar.myPresets": "My Presets",
    "sidebar.noPresets": "No saved presets yet",

    // Editor
    "editor.emptyPage": "Drop components here",
    "editor.emptyPageHint": "Drag a component from the left panel or click + to add a section.",

    // Export dialog
    "export.title": "Export Website",
    "export.outputPath": "Output Folder",
    "export.browse": "Browse",
    "export.minify": "Minify HTML/CSS",
    "export.includeProject": "Include project file",
    "export.exportBtn": "Export",
    "export.exporting": "Exporting…",
    "export.done": "Export complete",
    "export.openFolder": "Open folder",

    // Theme editor
    "theme.title": "Theme Editor",
    "theme.colors": "Colors",
    "theme.typography": "Typography",
    "theme.layout": "Layout",
    "theme.projectSettings": "Project Settings",
    "theme.contrastChecker": "Contrast Checker",
    "theme.save": "Save Theme",

    // Deploy dialog
    "deploy.title": "Publish via FTP / SFTP",
    "deploy.host": "Host",
    "deploy.port": "Port",
    "deploy.username": "Username",
    "deploy.password": "Password",
    "deploy.remotePath": "Remote Path",
    "deploy.passiveMode": "Passive mode (recommended)",
    "deploy.testConnection": "Test Connection",
    "deploy.testing": "Testing…",
    "deploy.deploy": "Deploy",
    "deploy.deploying": "Deploying…",
    "deploy.close": "Close",

    // Common
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.loading": "Loading…",
    "common.error": "Error",
    "common.success": "Success",
    "common.name": "Name",
    "common.description": "Description",
    "common.save": "Save",
  },

  de: {
    // Dashboard
    "dashboard.title": "Meine Projekte",
    "dashboard.newProject": "Neues Projekt",
    "dashboard.noProjects": "Noch keine Projekte",
    "dashboard.noProjectsHint": "Erstelle dein erstes Website-Projekt, um loszulegen.",
    "dashboard.recent": "Zuletzt geöffnet",
    "dashboard.searchPlaceholder": "Projekte suchen…",

    // Project card actions
    "project.open": "Öffnen",
    "project.rename": "Umbenennen",
    "project.duplicate": "Duplizieren",
    "project.delete": "Löschen",
    "project.updatedAt": "Aktualisiert",

    // Topbar
    "topbar.save": "Speichern",
    "topbar.saving": "Speichert…",
    "topbar.export": "Exportieren",
    "topbar.preview": "Vorschau",
    "topbar.theme": "Design",
    "topbar.backToDashboard": "Zurück zur Übersicht",

    // Sidebar
    "sidebar.components": "Komponenten",
    "sidebar.pages": "Seiten",
    "sidebar.properties": "Eigenschaften",
    "sidebar.addPage": "Seite hinzufügen",
    "sidebar.importPage": "Seite importieren",
    "sidebar.addSection": "Abschnitt hinzufügen",
    "sidebar.myPresets": "Meine Vorlagen",
    "sidebar.noPresets": "Noch keine gespeicherten Vorlagen",

    // Editor
    "editor.emptyPage": "Komponenten hierher ziehen",
    "editor.emptyPageHint": "Ziehe eine Komponente aus dem linken Panel oder klicke auf +, um einen Abschnitt hinzuzufügen.",

    // Export dialog
    "export.title": "Website exportieren",
    "export.outputPath": "Ausgabeordner",
    "export.browse": "Durchsuchen",
    "export.minify": "HTML/CSS minimieren",
    "export.includeProject": "Projektdatei einschließen",
    "export.exportBtn": "Exportieren",
    "export.exporting": "Exportiert…",
    "export.done": "Export abgeschlossen",
    "export.openFolder": "Ordner öffnen",

    // Theme editor
    "theme.title": "Design-Editor",
    "theme.colors": "Farben",
    "theme.typography": "Typografie",
    "theme.layout": "Layout",
    "theme.projectSettings": "Projekteinstellungen",
    "theme.contrastChecker": "Kontrast-Prüfer",
    "theme.save": "Design speichern",

    // Deploy dialog
    "deploy.title": "Via FTP / SFTP veröffentlichen",
    "deploy.host": "Host",
    "deploy.port": "Port",
    "deploy.username": "Benutzername",
    "deploy.password": "Passwort",
    "deploy.remotePath": "Remote-Pfad",
    "deploy.passiveMode": "Passivmodus (empfohlen)",
    "deploy.testConnection": "Verbindung testen",
    "deploy.testing": "Teste…",
    "deploy.deploy": "Veröffentlichen",
    "deploy.deploying": "Lädt hoch…",
    "deploy.close": "Schließen",

    // Common
    "common.cancel": "Abbrechen",
    "common.confirm": "Bestätigen",
    "common.close": "Schließen",
    "common.loading": "Lädt…",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.name": "Name",
    "common.description": "Beschreibung",
    "common.save": "Speichern",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
