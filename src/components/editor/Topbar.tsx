import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { cmd_saveProject } from "../../lib/tauri";

const PREVIEW_LABELS: Record<string, string> = {
  desktop: "🖥",
  tablet: "📱",
  mobile: "📱",
};

export default function Topbar() {
  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const markClean = useProjectStore((s) => s.markClean);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaving = useEditorStore((s) => s.setSaving);
  const previewMode = useEditorStore((s) => s.previewMode);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const setView = useEditorStore((s) => s.setView);
  const openExport = useEditorStore((s) => s.openExportDialog);
  const openDeploy = useEditorStore((s) => s.openDeployDialog);
  const openTheme = useEditorStore((s) => s.openThemeEditor);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    try {
      await cmd_saveProject(project as any);
      markClean();
    } catch (e) {
      alert(`Save failed: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="h-12 bg-white border-b border-[#e2e8f0] flex items-center px-4 gap-3 shrink-0 z-20">
      {/* Logo / back */}
      <button
        onClick={() => setView("dashboard")}
        className="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] transition-colors"
        title="Back to Dashboard"
      >
        <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center text-white text-xs font-bold">
          SP
        </div>
      </button>

      <div className="w-px h-6 bg-[#e2e8f0]" />

      {/* Project name */}
      <span className="text-sm font-medium text-[#1e293b] truncate max-w-48">
        {project?.name ?? "Untitled"}
      </span>
      {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unsaved changes" />}

      <div className="flex-1" />

      {/* Preview mode */}
      <div className="flex items-center bg-[#f1f5f9] rounded-lg p-0.5 gap-0.5">
        {(["desktop", "tablet", "mobile"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
              previewMode === mode
                ? "bg-white text-[#1e293b] shadow-sm"
                : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            {mode === "desktop" ? "🖥 Desktop" : mode === "tablet" ? "📱 Tablet" : "📱 Mobile"}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#e2e8f0]" />

      {/* Theme */}
      <button
        onClick={openTheme}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
      >
        🎨 Theme
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-40"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>

      {/* Export */}
      <button
        onClick={openExport}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
      >
        Export
      </button>

      {/* Publish */}
      <button
        onClick={openDeploy}
        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Publish
      </button>
    </header>
  );
}
