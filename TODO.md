# StackPage — Roadmap & Open Tasks

Status: **v1.0 feature-complete** — all planned features implemented.

---

## v0.2 — Editor Quality

- [x] **Undo / Redo** — Ctrl+Z / Ctrl+Y for all project mutations (blocks, sections, pages, theme)
- [x] **Inline text editing** — double-click a Heading or Text block to edit text directly on the canvas instead of only via the properties panel
- [x] **Block duplication** — "Duplicate" button (⧉) in the ComponentBlock toolbar
- [x] **Section duplication** — duplicate an entire section including all its blocks
- [x] **Section settings** — background color, background image, padding, max-width per section
- [x] **Empty page placeholder** — visual prompt when a page has no sections yet
- [x] **Keyboard shortcuts** — Delete key to remove selected block, Escape to deselect
- [x] **Multi-select blocks** — shift-click to select multiple blocks and move/delete them together

---

## v0.2 — New Block Types

- [x] **Slide Banner block** — image slider with autoplay, indicators, navigation arrows, per-slide title/subtitle/CTA, overlay color settings
- [x] **Video block** — embed YouTube / Vimeo or local `<video>` with controls
- [x] **Divider / Spacer block** — horizontal rule or configurable whitespace
- [x] **Icon block** — pick from a built-in SVG icon set
- [x] **Map block** — embed a Google Maps or OpenStreetMap iframe
- [x] **Testimonial block** — quote + author + avatar layout
- [x] **Pricing table block** — configurable columns with feature lists and CTA buttons
- [x] **Hero block** — full-width section with heading, subtext, CTA, and background image

---

## v0.3 — Export & Deploy

- [x] **CSS custom properties output** — export theme as CSS variables (`--primary`, `--font-body`, …)
- [x] **Minify HTML/CSS on export** — reduce file size for production builds
- [x] **Asset bundling** — copy referenced local images into the export folder automatically
- [x] **Relative asset paths** — ensure images and links work from any subfolder
- [x] **Sitemap.xml generation** — auto-generate on export
- [x] **SFTP / SSH deploy** — support SFTP in addition to plain FTP
- [x] **Netlify Drop integration** — one-click deploy to Netlify via API
- [x] **Preview in default browser** — "Open Preview" button that launches exported output in the OS browser
- [x] **Live preview pane** — split-view or side panel showing a rendered preview while editing

---

## v0.4 — Templates & Reuse

- [x] **Page templates** — starter layouts (Landing Page, About, Contact, Portfolio) that pre-populate sections and blocks
- [x] **Block presets / snippets** — save a configured block as a reusable preset
- [x] **Global components** — mark a Navigation or Footer as "global" so changes sync across all pages
- [x] **Import / export individual pages** — share page layouts between projects

---

## v0.5 — Project Management

- [x] **Project thumbnail / screenshot** — auto-generate a preview image shown on the Dashboard
- [x] **Recents list** — persist recently opened project file paths across app restarts
- [x] **Auto-save** — save project to disk automatically every N seconds if dirty
- [x] **Project versioning** — keep backups of previous save states (`.stackpage.bak`)
- [x] **Rename / duplicate project** — from the Dashboard
- [x] **Project metadata** — author, creation date, tags visible in Dashboard

---

## v0.6 — Accessibility & SEO

- [x] **Per-page SEO fields** — `<title>`, `<meta description>`, Open Graph tags
- [x] **Alt text enforcement** — warn when an Image block has an empty alt text
- [x] **Lang attribute** — set `<html lang="…">` from project settings
- [x] **Semantic HTML output** — use `<header>`, `<main>`, `<footer>`, `<section>`, `<article>` appropriately
- [x] **Contrast checker** — warn in Theme Editor when foreground/background contrast is too low (WCAG AA)

---

## v1.0 — Polish & Distribution

- [x] **Auto-updater** — Tauri updater plugin, notify user when a new version is available
- [x] **Onboarding flow** — first-launch wizard with a template picker
- [x] **Windows Store / Mac App Store packaging**
- [x] **Localization (i18n)** — English + German UI strings
- [x] **Crash reporting / telemetry opt-in**
- [x] **Comprehensive test suite** — unit tests for the HTML generator, integration tests for store mutations
