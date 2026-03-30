import { useState } from "react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { exportProject } from "../../engine/export/htmlGenerator";
import { cmd_writeExportFiles, cmd_copyAsset, pickDirectory, openInBrowser } from "../../lib/tauri";
import type { Project } from "../../types/project";

function isLocalPath(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return false;
  return true;
}

async function bundleLocalAssets(project: Project, outputPath: string) {
  const seen = new Set<string>();
  for (const page of project.pages) {
    for (const section of page.sections) {
      for (const block of section.blocks) {
        const props = block.props as unknown as Record<string, unknown>;
        // Collect candidate src fields
        const candidates: string[] = [];
        if (typeof props.src === "string") candidates.push(props.src);
        if (typeof props.backgroundImage === "string") candidates.push(props.backgroundImage);
        if (Array.isArray(props.slides)) {
          for (const slide of props.slides as Array<Record<string, unknown>>) {
            if (typeof slide.image === "string") candidates.push(slide.image);
          }
        }
        for (const src of candidates) {
          if (isLocalPath(src) && !seen.has(src)) {
            seen.add(src);
            // Copy to images/ subfolder in output, ignoring errors (file may not exist)
            try {
              const fileName = src.split(/[/\\]/).pop() ?? "image";
              await cmd_copyAsset(src, `images/${fileName}`, outputPath);
            } catch {
              // Non-fatal: local asset not found or can't copy
            }
          }
        }
      }
    }
  }
}

type Step = "idle" | "exporting" | "done" | "error";

export default function ExportDialog() {
  const project = useProjectStore((s) => s.project)!;
  const updateProjectMeta = useProjectStore((s) => s.updateProjectMeta);
  const updateExportSettings = useProjectStore((s) => s.updateExportSettings);
  const closeExport = useEditorStore((s) => s.closeExportDialog);

  const [outputPath, setOutputPath] = useState<string>(
    project.exportSettings.outputPath ?? ""
  );
  const [siteUrl, setSiteUrl] = useState(project.siteUrl ?? "");
  const [minify, setMinify] = useState(project.exportSettings.minify);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string>("");
  const [fileCount, setFileCount] = useState(0);
  const [lastOutputPath, setLastOutputPath] = useState("");

  async function handlePickDir() {
    const dir = await pickDirectory();
    if (dir) {
      setOutputPath(dir);
      updateExportSettings({ outputPath: dir });
    }
  }

  async function handleExport() {
    if (!outputPath.trim()) {
      setError("Please choose an output folder first.");
      return;
    }
    setStep("exporting");
    setError("");
    try {
      // Persist siteUrl + minify + outputPath back to project
      updateProjectMeta({ siteUrl: siteUrl.trim() || undefined });
      updateExportSettings({ outputPath: outputPath.trim(), minify });
      const exportFiles = exportProject({ ...project, siteUrl: siteUrl.trim() || undefined, exportSettings: { ...project.exportSettings, minify } });
      await cmd_writeExportFiles(exportFiles, outputPath.trim());

      // Bundle local assets (images with non-http src)
      await bundleLocalAssets(project, outputPath.trim());

      setFileCount(exportFiles.length);
      setLastOutputPath(outputPath.trim());
      setStep("done");
    } catch (e: unknown) {
      setError(String(e));
      setStep("error");
    }
  }

  async function handlePreview() {
    try {
      const indexPath = lastOutputPath.replace(/\\/g, "/") + "/index.html";
      await openInBrowser(indexPath);
    } catch (e: unknown) {
      setError("Could not open browser: " + String(e));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1e293b]">Export Website</h2>
          <button
            onClick={closeExport}
            className="text-[#94a3b8] hover:text-[#1e293b] text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {step === "done" ? (
          <>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                ✓
              </div>
              <p className="text-sm text-[#64748b] text-center">
                {fileCount} file{fileCount !== 1 ? "s" : ""} exported successfully to:
              </p>
              <code className="text-xs bg-[#f1f5f9] px-3 py-2 rounded-lg break-all text-[#1e293b]">
                {lastOutputPath}
              </code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="flex-1 border border-[#2563eb] text-[#2563eb] py-2.5 rounded-lg text-sm font-medium hover:bg-[#eff6ff] transition-colors"
              >
                Open in Browser
              </button>
              <button
                onClick={closeExport}
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </>
        ) : (
          <>
            {/* Output folder */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#374151]">Output Folder</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  placeholder="Choose a folder…"
                  className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
                />
                <button
                  onClick={handlePickDir}
                  className="px-3 py-2 border border-[#d1d5db] rounded-lg text-sm text-[#64748b] hover:bg-[#f1f5f9] transition-colors shrink-0"
                >
                  Browse…
                </button>
              </div>
            </div>

            {/* Site URL for sitemap */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#374151]">Site URL <span className="text-[#94a3b8] font-normal">(for sitemap.xml)</span></label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
              />
            </div>

            {/* Minify option */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={minify}
                onChange={(e) => setMinify(e.target.checked)}
                className="w-4 h-4 accent-[#2563eb]"
              />
              <span className="text-sm text-[#374151]">Minify HTML &amp; CSS</span>
            </label>

            {/* Info */}
            <div className="bg-[#f8fafc] rounded-lg p-3 text-xs text-[#64748b] leading-relaxed">
              Generates static HTML, CSS, JS, and <code>sitemap.xml</code>. One <code>.html</code> file per page.
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeExport}
                className="flex-1 border border-[#d1d5db] text-[#374151] py-2.5 rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={step === "exporting"}
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {step === "exporting" ? "Exporting…" : "Export"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
