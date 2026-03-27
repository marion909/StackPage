import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { cmd_saveProject } from "../../lib/tauri";
import { captureEditorThumbnail } from "../../lib/thumbnail";
import { useI18n } from "../../i18n";

export default function Topbar() {
  const { t } = useI18n();
  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const markClean = useProjectStore((s) => s.markClean);
  const past = useProjectStore((s) => s.past);
  const future = useProjectStore((s) => s.future);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setSaving = useEditorStore((s) => s.setSaving);
  const previewMode = useEditorStore((s) => s.previewMode);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const setView = useEditorStore((s) => s.setView);
  const openExport = useEditorStore((s) => s.openExportDialog);
  const openDeploy = useEditorStore((s) => s.openDeployDialog);
  const openNetlify = useEditorStore((s) => s.openNetlifyDialog);
  const openTheme = useEditorStore((s) => s.openThemeEditor);
  const isPreviewOpen = useEditorStore((s) => s.isPreviewOpen);
  const togglePreview = useEditorStore((s) => s.togglePreview);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    try {
      // Capture thumbnail before saving
      const thumbnail = await captureEditorThumbnail();
      const projectToSave = thumbnail ? { ...project, thumbnail } : project;
      await cmd_saveProject(projectToSave as any);
      if (thumbnail) {
        useProjectStore.getState().updateProjectMeta({ thumbnail } as any);
      }
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
        title={t("topbar.backToDashboard")}
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

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={past.length === 0}
        title="Undo (Ctrl+Z)"
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-2 py-1 rounded hover:bg-[#f1f5f9] transition-colors disabled:opacity-30"
      >
        ↩
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        title="Redo (Ctrl+Y)"
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-2 py-1 rounded hover:bg-[#f1f5f9] transition-colors disabled:opacity-30"
      >
        ↪
      </button>

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
        🎨 {t("topbar.theme")}
      </button>

      {/* Preview toggle */}
      <button
        onClick={togglePreview}
        title="Toggle live preview pane"
        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
          isPreviewOpen
            ? "bg-[#eff6ff] text-[#2563eb] font-medium"
            : "text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]"
        }`}
      >
        👁 {t("topbar.preview")}
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-40"
      >
        {isSaving ? t("topbar.saving") : t("topbar.save")}
      </button>

      {/* Export */}
      <button
        onClick={openExport}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
      >
        {t("topbar.export")}
      </button>

      {/* Publish via FTP */}
      <button
        onClick={openDeploy}
        className="text-sm text-[#64748b] hover:text-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
      >
        FTP
      </button>

      {/* Publish to Netlify */}
      <button
        onClick={openNetlify}
        className="bg-[#00c7b7] hover:bg-[#00b3a4] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
      >
        <span>▲</span> Netlify
      </button>
    </header>
  );
}
