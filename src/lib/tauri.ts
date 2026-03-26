import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { Project, ProjectMeta } from "../types/project";

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

export async function cmd_exportProject(project: Project, outputPath: string): Promise<void> {
  return invoke<void>("export_project", { project, outputPath });
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

// ─── Dialog Helpers ────────────────────────────────────────────────────────

export async function pickDirectory(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false });
  if (typeof result === "string") return result;
  return null;
}

export async function pickSaveDir(title: string): Promise<string | null> {
  const result = await save({ title, filters: [] });
  if (typeof result === "string") return result;
  return null;
}
