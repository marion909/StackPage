import { useState, useEffect } from "react";
import type { ProjectMeta } from "../../types/project";
import { createNewProject } from "../../types/project";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { cmd_listProjects, cmd_loadProject, cmd_createProject, cmd_deleteProject, pickDirectory } from "../../lib/tauri";
import NewProjectDialog from "./NewProjectDialog";
import ProjectCard from "./ProjectCard";

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setProject = useProjectStore((s) => s.setProject);
  const setView = useEditorStore((s) => s.setView);
  const setActivePageId = useEditorStore((s) => s.setActivePageId);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const list = await cmd_listProjects();
      setProjects(list);
    } catch (e) {
      // First run — no projects yet, that's fine
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenProject(meta: ProjectMeta) {
    try {
      const project = await cmd_loadProject(meta.filePath);
      setProject(project as any);
      if (project.theme) setTheme(project.theme as any);
      setActivePageId(project.pages?.[0]?.id ?? null);
      setView("editor");
    } catch (e) {
      setError(`Failed to open project: ${e}`);
    }
  }

  async function handleCreateProject(name: string, description: string) {
    try {
      const dir = await pickDirectory();
      if (!dir) return;
      const project = await cmd_createProject(name, description, dir);
      setProject(project as any);
      if (project.theme) setTheme(project.theme as any);
      setActivePageId((project as any).pages?.[0]?.id ?? null);
      setView("editor");
      setShowNew(false);
    } catch (e) {
      setError(`Failed to create project: ${e}`);
    }
  }

  async function handleDeleteProject(meta: ProjectMeta) {
    if (!confirm(`Delete project "${meta.name}"?\nThis removes the project file only.`)) return;
    try {
      await cmd_deleteProject(meta.filePath);
      setProjects((prev) => prev.filter((p) => p.id !== meta.id));
    } catch (e) {
      setError(`Failed to delete: ${e}`);
    }
  }

  // Dev/offline fallback: open a blank project without Tauri
  function handleNewProjectOffline(name: string, description: string) {
    const project = createNewProject(name, description);
    setProject(project);
    setActivePageId(project.pages[0].id);
    setView("editor");
    setShowNew(false);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            SP
          </div>
          <span className="font-semibold text-[#1e293b] text-lg">StackPage</span>
          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">v0.1</span>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Project
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)} className="ml-4 font-bold">×</button>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Projects</h1>
          <p className="text-[#64748b] text-sm mt-1">Open an existing project or create a new one.</p>
        </div>

        {loading ? (
          <div className="text-[#64748b] text-sm">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-[#1e293b] font-medium mb-2">No projects yet</h3>
            <p className="text-[#64748b] text-sm mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((meta) => (
              <ProjectCard
                key={meta.id}
                meta={meta}
                onOpen={() => handleOpenProject(meta)}
                onDelete={() => handleDeleteProject(meta)}
              />
            ))}
          </div>
        )}
      </main>

      {showNew && (
        <NewProjectDialog
          onClose={() => setShowNew(false)}
          onCreate={handleCreateProject}
          onCreateOffline={handleNewProjectOffline}
        />
      )}
    </div>
  );
}
