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

---

## v1.1 — Layout Blocks

Goal: give users much more control over page structure beyond 2- and 3-column grids.

### New block types

- [x] **4-Column block** (`four-column`) — equal-width quad grid, `stackOnMobile`, gap & padding controls; same child-block pattern as `two-column` / `three-column`
- [x] **Asymmetric Column block** (`asymmetric-column`) — two columns with a freely configurable split ratio (sidebar + content, e.g. 25/75, 33/67, 40/60, 66/34 …), selectable via dropdown presets plus a custom "left width %" slider
- [x] **Vertical Stack block** (`vertical-stack`) — a single column that stacks child blocks with configurable gap, alignment (start / center / end / stretch), and an optional divider between items; useful for feature lists, step-by-step flows, and sidebar content
- [x] **Masonry Grid block** (`masonry-grid`) — CSS-columns-based masonry layout; configurable column count (2–5) and gap; each child block is an independent card slot

### Changes to existing layout blocks

- [x] **TwoColumnBlock / ThreeColumnBlock** — add individual per-column background color and vertical-alignment options (top / center / bottom)
- [x] **Sidebar category in palette** — group `four-column`, `asymmetric-column`, `vertical-stack`, `masonry-grid` under the existing "Layout" category in the left sidebar

### Type-system changes (`src/types/blocks.ts`)

- [x] Add `FourColumnProps` / `FourColumnBlock` interface — mirrors `ThreeColumnProps` plus `col4Children`
- [x] Add `AsymmetricColumnProps` / `AsymmetricColumnBlock` — `leftWidth: number`, split ratio presets, left/right children
- [x] Add `VerticalStackProps` / `VerticalStackBlock` — `gap: number`, `align: string`, `showDivider: boolean`, `children: Block[]`
- [x] Add `MasonryGridProps` / `MasonryGridBlock` — `columns: 2|3|4|5`, `gap: number`, `items: Block[][]`
- [x] Extend `BlockType` union and `BLOCK_TYPES` metadata array with the four new types

### Rendering & export

- [x] Implement React render components in `src/components/blocks/`
- [x] Add HTML export templates for each new block in `src/engine/export/htmlGenerator.ts`
- [x] Add default props in `src/lib/blockDefaults.ts`
- [x] Add right-sidebar property panels (`src/components/editor/Sidebar/`) for each new block
- [x] Add unit tests for new block HTML output in `htmlGenerator.test.ts`

---

## v1.2 — Shop Components

Goal: allow users to build static product showcase pages and link through to any checkout system (Stripe, Shopify Buy Button, WooCommerce, custom URL).

> **Scope:** StackPage exports static HTML — there is no server-side cart or order management. All "cart" interactions are implemented client-side (localStorage) with a small injected JS snippet, or are simply deep-links to an external store.

### New block types

- [x] **Product Card block** (`product-card`) — single product tile with image, name, short description, price, optional badge (e.g. "Sale", "New"), and a CTA button; fully themeable
- [x] **Product Grid block** (`product-grid`) — 2–4 column grid of `ProductCardItem` objects (defined inline, not a separate block); sortable item list in the right sidebar; column count & gap controls
- [x] **Product Detail block** (`product-detail`) — hero-style full-width product view with large image (or image gallery thumbnails), name, price, description text, feature bullets, and a primary CTA; layout variants: image-left, image-right, image-top
- [x] **Cart Button / Mini Cart block** (`cart-button`) — floating or inline cart icon showing item count (stored in `localStorage`); clicking expands a slide-out panel listing added items; generates a small self-contained JS snippet on export

### Data model (`src/types/blocks.ts`)

```ts
interface ProductCardItem {
  id: string;
  name: string;
  description: string;
  price: string;          // display string, e.g. "€ 29.90"
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;        // external checkout / product link
  ctaTarget: "_self" | "_blank";
}
```

- [x] `ProductCardProps` — single `ProductCardItem` + layout props (padding, border, shadow, borderRadius)
- [x] `ProductGridProps` — `items: ProductCardItem[]`, `columns: 2|3|4`, `gap`, padding, `cardStyle` (flat / outlined / shadowed)
- [x] `ProductDetailProps` — `item: ProductCardItem`, `features: string[]`, `layout: "image-left"|"image-right"|"image-top"`, `showImageGallery: boolean`, `galleryImages: string[]`
- [x] `CartButtonProps` — `position: "fixed-bottom-right"|"fixed-bottom-left"|"inline"`, `backgroundColor`, `iconColor`, `label`

### Rendering & export

- [x] React render components in `src/components/blocks/shop/`
- [x] `CartButton` generates a `<script>` block in the HTML export (`src/engine/export/jsGenerator.ts`) — a ~50-line vanilla JS snippet for localStorage cart state; no external dependencies
- [x] HTML export templates for all four blocks in `htmlGenerator.ts`
- [x] Default props in `blockDefaults.ts`
- [x] Right-sidebar property panels with an inline product list editor (add / remove / reorder items)
- [x] New "Shop" category in `BLOCK_TYPES` metadata and the left panel palette

### Page templates (v1.2 addition)

- [x] **Product Landing Page** template — Hero + Product Detail + Product Grid (3 related items) + CTA section
- [x] **Shop Showcase** template — Navigation + Product Grid (6 items, 3 cols) + Footer

---

## Nice to Have — Backlog

Features that would improve the product but are not planned for a specific release.

### Editor UX
- [ ] **Block search / filter in palette** — type to filter available block types
- [ ] **Drag block between sections** — currently blocks can only be reordered within a section
- [ ] **Copy / paste blocks** — Ctrl+C / Ctrl+V to copy a block within or across pages
- [ ] **Section collapse** — collapse a section in the editor to reduce canvas clutter
- [ ] **Canvas zoom** — zoom in/out on the canvas (Ctrl+scroll)
- [ ] **Right-click context menu** — duplicate, delete, move up/down via right-click on canvas
- [ ] **Block notes/comments** — attach an internal note to any block (not exported)

### Blocks & Content
- [ ] **FAQ / Accordion block** — expandable question/answer pairs
- [ ] **Timeline block** — vertical or horizontal step-based timeline
- [ ] **Countdown block** — live JS countdown to a target date
- [ ] **Cookie Banner block** — GDPR-compliant cookie notice with accept/decline
- [ ] **Social Share block** — share buttons for Twitter/X, Facebook, LinkedIn, WhatsApp
- [ ] **Embed block** — generic `<iframe>` or raw HTML embed (e.g. Typeform, Cal.com)
- [ ] **Before/After Slider block** — image comparison slider
- [ ] **Lottie / SVG Animation block** — embed a Lottie JSON animation

### Theme & Styling
- [ ] **Dark mode toggle** — let exported sites support light/dark mode switching
- [ ] **Custom CSS field** — per-block or per-page raw CSS override
- [ ] **Google Fonts picker** — searchable dropdown for all Google Fonts instead of a text input
- [ ] **Gradient background** — support linear/radial gradients on sections and blocks
- [ ] **Animation presets** — simple entrance animations (fade-in, slide-up) on scroll via CSS

### Export & Deploy
- [ ] **GitHub Pages deploy** — push exported files to a GitHub Pages branch automatically
- [ ] **ZIP download** — download the entire export as a ZIP without needing to choose a folder
- [ ] **Custom domain mapping in Netlify** — set a custom domain after Netlify deploy
- [ ] **FTP incremental sync** — only upload changed files instead of the full site

### Project Management
- [ ] **Cloud sync / backup** — optional sync to a user-configured S3 / Dropbox / OneDrive folder
- [ ] **Multi-language pages** — manage translations of a page side-by-side
- [ ] **Project templates marketplace** — browse and import community-made templates
- [ ] **Collaboration (future)** — share a project link for read-only or comment-only review
