import type { Block } from "./blocks";
import type { Theme } from "./theme";
import { DEFAULT_THEME } from "./theme";
import { nanoid } from "./nanoid";

export interface Section {
  id: string;
  label?: string;
  isGlobal?: boolean; // synced across all pages when changed
  globalId?: string;  // unique identifier shared across all instances of this global section
  blocks: Block[];
  backgroundColor?: string;
  backgroundImage?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  maxWidth?: number; // px, undefined = use theme maxWidth
  fullWidth: boolean;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  title?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  sections: Section[];
  order: number;
}

export interface ExportSettings {
  outputType: "html" | "php";
  outputPath?: string;
  minify: boolean;
  includeProjectFile: boolean;
}

export interface DeploySettings {
  protocol: "ftp" | "sftp";
  host: string;
  port: number;
  username: string;
  // password is NOT stored in plain text in state — managed separately
  remotePath: string;
  passive: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "file";
  src: string; // relative path from project root
  mimeType: string;
  size: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  author?: string;
  tags?: string[];
  siteUrl?: string;
  lang?: string; // HTML lang attribute, e.g. "en", "de"
  createdAt: string; // ISO 8601
  updatedAt: string;
  pages: Page[];
  assets: Asset[];
  theme: Theme;
  exportSettings: ExportSettings;
  deploySettings?: DeploySettings;
  thumbnail?: string; // base64 data URL, generated on save
  projectFilePath?: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  description?: string;
  author?: string;
  tags?: string[];
  thumbnail?: string;
  updatedAt: string;
  filePath: string;
}

// Factory helpers
export function createNewProject(name: string, description?: string): Project {
  const homePageId = nanoid();
  return {
    id: nanoid(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: homePageId,
        name: "Home",
        slug: "index",
        sections: [],
        order: 0,
      },
    ],
    assets: [],
    theme: DEFAULT_THEME,
    exportSettings: {
      outputType: "html",
      minify: false,
      includeProjectFile: true,
    },
  };
}

export function createNewPage(name: string, order: number): Page {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return {
    id: nanoid(),
    name,
    slug,
    sections: [],
    order,
  };
}

export function createNewSection(): Section {
  return {
    id: nanoid(),
    blocks: [],
    paddingTop: 64,
    paddingBottom: 64,
    paddingLeft: 16,
    paddingRight: 16,
    fullWidth: false,
  };
}
