import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { Project, ProjectMeta, Page } from "../types/project";

// ─── Project Commands ──────────────────────────────────────────────────────

export async function cmd_listProjects(): Promise<ProjectMeta[]> {
  return invoke<ProjectMeta[]>("list_projects");
}

export async function cmd_loadProject(filePath: string): Promise<Project> {
  return invoke<Project>("load_project", { filePath });
}

export async function cmd_saveProject(project: Project): Promise<void> {
  return invoke<void>("save_project", { project });
}

export async function cmd_createProject(
  name: string,
  description: string,
  dirPath: string
): Promise<Project> {
  return invoke<Project>("create_project", { name, description, dirPath });
}

export async function cmd_deleteProject(filePath: string): Promise<void> {
  return invoke<void>("delete_project", { filePath });
}

export async function cmd_duplicateProject(
  filePath: string,
  newName: string,
  destDir: string
): Promise<Project> {
  return invoke<Project>("duplicate_project", { filePath, newName, destDir });
}

// ─── Export Commands ───────────────────────────────────────────────────────

export interface ExportFile {
  relativePath: string;
  content: string;
}

/** Write pre-generated files (HTML/CSS/JS) to the chosen output directory. */
export async function cmd_writeExportFiles(
  files: ExportFile[],
  outputPath: string
): Promise<void> {
  return invoke<void>("write_export_files", { files, outputPath });
}

export async function cmd_copyAsset(
  srcPath: string,
  destRelative: string,
  outputPath: string
): Promise<void> {
  return invoke<void>("copy_asset", { srcPath, destRelative, outputPath });
}

// ─── Deploy Commands ───────────────────────────────────────────────────────

export interface FtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  passive: boolean;
  remotePath: string;
}

export async function cmd_testFtp(config: Omit<FtpConfig, "remotePath">): Promise<string> {
  return invoke<string>("test_ftp_connection", { config });
}

export async function cmd_deployFtp(
  config: FtpConfig,
  localPath: string
): Promise<string> {
  return invoke<string>("deploy_ftp", { config, localPath });
}

// ─── SFTP Commands ─────────────────────────────────────────────────────────

export interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath: string;
}

export async function cmd_testSftp(config: SftpConfig): Promise<string> {
  return invoke<string>("test_sftp_connection", { config });
}

export async function cmd_deploySftp(
  config: SftpConfig,
  localPath: string
): Promise<string> {
  return invoke<string>("deploy_sftp", { config, localPath });
}

export async function openInBrowser(filePath: string): Promise<void> {
  // Build a proper file:// URL from a native Windows path
  const url = "file:///" + filePath.replace(/\\/g, "/");
  await openUrl(url);
}

// ─── Dialog Helpers ────────────────────────────────────────────────────────

export async function pickDirectory(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false });
  if (typeof result === "string") return result;
  return null;
}

export async function pickFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  const result = await open({ directory: false, multiple: false, filters });
  if (typeof result === "string") return result;
  return null;
}

export async function pickSaveDir(title: string): Promise<string | null> {
  const result = await save({ title, filters: [] });
  if (typeof result === "string") return result;
  return null;
}

// ─── Page Import / Export ──────────────────────────────────────────────────

export async function exportPageToFile(page: Page): Promise<boolean> {
  const filePath = await save({
    title: "Export Page",
    filters: [{ name: "StackPage Page", extensions: ["stackpage-page.json"] }],
    defaultPath: `${page.slug}.stackpage-page.json`,
  });
  if (!filePath) return false;
  await writeTextFile(filePath, JSON.stringify(page, null, 2));
  return true;
}

export async function importPageFromFile(): Promise<Page | null> {
  const filePath = await open({
    title: "Import Page",
    filters: [{ name: "StackPage Page", extensions: ["stackpage-page.json", "json"] }],
    multiple: false,
    directory: false,
  });
  if (!filePath || typeof filePath !== "string") return null;
  const content = await readTextFile(filePath);
  const page: Page = JSON.parse(content);
  return page;
}
