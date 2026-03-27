# StackPage — Roadmap & Open Tasks

Status: **v0.1 MVP complete** — editor functional, export + FTP deploy working, drag-and-drop fixed.

---

## v0.2 — Editor Quality

- [ ] **Undo / Redo** — Ctrl+Z / Ctrl+Y for all project mutations (blocks, sections, pages, theme)
- [ ] **Inline text editing** — double-click a Heading or Text block to edit text directly on the canvas instead of only via the properties panel
- [ ] **Block duplication** — "Duplicate" button in the ComponentBlock toolbar
- [ ] **Section duplication** — duplicate an entire section including all its blocks
- [ ] **Section settings** — background color, background image, padding, max-width per section
- [ ] **Empty page placeholder** — visual prompt when a page has no sections yet
- [ ] **Keyboard shortcuts** — Delete key to remove selected block, Escape to deselect
- [ ] **Multi-select blocks** — shift-click to select multiple blocks and move/delete them together

---

## v0.2 — New Block Types

- [ ] **Video block** — embed YouTube / Vimeo or local `<video>` with controls
- [ ] **Divider / Spacer block** — horizontal rule or configurable whitespace
- [ ] **Icon block** — pick from a built-in SVG icon set
- [ ] **Map block** — embed a Google Maps or OpenStreetMap iframe
- [ ] **Testimonial block** — quote + author + avatar layout
- [ ] **Pricing table block** — configurable columns with feature lists and CTA buttons
- [ ] **Hero block** — full-width section with heading, subtext, CTA, and background image

---

## v0.3 — Export & Deploy

- [ ] **CSS custom properties output** — export theme as CSS variables (`--primary`, `--font-body`, …)
- [ ] **Minify HTML/CSS on export** — reduce file size for production builds
- [ ] **Asset bundling** — copy referenced local images into the export folder automatically
- [ ] **Relative asset paths** — ensure images and links work from any subfolder
- [ ] **Sitemap.xml generation** — auto-generate on export
- [ ] **SFTP / SSH deploy** — support SFTP in addition to plain FTP
- [ ] **Netlify Drop integration** — one-click deploy to Netlify via API
- [ ] **Preview in default browser** — "Open Preview" button that launches exported output in the OS browser
- [ ] **Live preview pane** — split-view or side panel showing a rendered preview while editing

---

## v0.4 — Templates & Reuse

- [ ] **Page templates** — starter layouts (Landing Page, About, Contact, Blog) that pre-populate sections and blocks
- [ ] **Block presets / snippets** — save a configured block as a reusable preset
- [ ] **Global components** — mark a Navigation or Footer as "global" so changes sync across all pages
- [ ] **Import / export individual pages** — share page layouts between projects

---

## v0.5 — Project Management

- [ ] **Project thumbnail / screenshot** — auto-generate a preview image shown on the Dashboard
- [ ] **Recents list** — persist recently opened project file paths across app restarts
- [ ] **Auto-save** — save project to disk automatically every N seconds if dirty
- [ ] **Project versioning** — keep backups of previous save states (`.stackpage.bak`)
- [ ] **Rename / duplicate project** — from the Dashboard
- [ ] **Project metadata** — author, creation date, tags visible in Dashboard

---

## v0.6 — Accessibility & SEO

- [ ] **Per-page SEO fields** — `<title>`, `<meta description>`, Open Graph tags
- [ ] **Alt text enforcement** — warn when an Image block has an empty alt text
- [ ] **Lang attribute** — set `<html lang="…">` from project settings
- [ ] **Semantic HTML output** — use `<header>`, `<main>`, `<footer>`, `<section>`, `<article>` appropriately
- [ ] **Contrast checker** — warn in Theme Editor when foreground/background contrast is too low (WCAG AA)

---

## v1.0 — Polish & Distribution

- [ ] **Auto-updater** — Tauri updater plugin, notify user when a new version is available
- [ ] **Onboarding flow** — first-launch wizard with a template picker
- [ ] **Windows Store / Mac App Store packaging**
- [ ] **Localization (i18n)** — English + German UI strings
- [ ] **Crash reporting / telemetry opt-in**
- [ ] **Comprehensive test suite** — unit tests for the HTML generator, integration tests for store mutations
