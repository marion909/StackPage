# StackPage

A desktop website builder for non-technical users. Create multi-page websites visually, then export clean HTML/CSS or deploy directly to a web server — no coding required.

Built with **Tauri 2**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## Features

- **Visual drag-and-drop editor** — drag components from the palette onto the canvas and reorder them freely
- **19 block types** — Heading, Text, Button, Image, Gallery, Hero, Slide Banner, Video, Divider/Spacer, Icon, Map, Testimonial, Pricing Table, Container, Two-Column, Three-Column, Contact Form, Navigation, Footer
- **Multi-page projects** — create and manage multiple pages per project, each with its own sections and blocks
- **Global sections** — mark a Navigation or Footer section as global to sync it automatically across all pages
- **Theme editor** — global color palette, typography (font family, sizes), spacing, border radius, and max-width
- **Per-block corner radius** — override the global border radius on individual blocks
- **Properties panel** — inline property editing for every block type (text, colors, alignment, links, …)
- **Contact form** — supports Formspree, Netlify Forms, and Mailto submit modes; field types include text, email, tel, textarea, date, time, number, URL, and dropdown (select)
- **HTML export** — generates clean, self-contained HTML + CSS files ready to upload; optional minification
- **FTP deploy** — deploy directly to any FTP/FTPS server from within the app
- **Netlify deploy** — one-click deploy to Netlify via drag-and-drop API
- **Auto-updater** — built-in update notifications via the Tauri updater plugin (signed releases)
- **Project persistence** — projects are saved as `.stackpage` JSON files on disk; fully offline
- **Undo / Redo** — full history for all project mutations (Ctrl+Z / Ctrl+Y)
- **Keyboard shortcuts** — Delete to remove selected block, Escape to deselect, Shift+click for multi-select

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (Rust) |
| UI framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State management | Zustand |
| Drag and drop | dnd-kit |
| Color picker | react-colorful |
| Build tool | Vite 7 |

---

## Requirements

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 9
- [Rust](https://rustup.rs/) (stable toolchain)
- Tauri system dependencies: see [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development app
pnpm tauri dev

# Build a production installer
pnpm tauri build
```

> On Windows, make sure `~/.cargo/bin` is in your `PATH` before running `pnpm tauri dev`.

---

## Project Structure

```
src/
├── app/                  # App entry, routing between Dashboard and Editor
├── components/
│   ├── blocks/           # Block renderer components (Heading, Text, Button, …)
│   ├── deploy/           # FTP deploy dialog
│   ├── editor/           # Editor layout, canvas, sidebar panels, drag-and-drop
│   │   └── Sidebar/      # Left sidebar (Pages, Components) + Right sidebar (Properties)
│   ├── export/           # HTML export dialog
│   └── project/          # Dashboard, project cards, new-project dialog
├── engine/
│   └── export/           # HTML/CSS generator
├── lib/
│   ├── blockDefaults.ts  # Default props factory for all block types
│   └── tauri.ts          # Tauri command wrappers (fs, ftp, dialog)
├── stores/               # Zustand stores (project state, editor ui state)
└── types/                # TypeScript types (blocks, project, theme)
src-tauri/                # Rust backend (Tauri commands, FTP, file I/O)
```

---

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
