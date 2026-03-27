import { useMemo } from "react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { generatePagePreview } from "../../engine/export/htmlGenerator";

export default function PreviewPane() {
  const project = useProjectStore((s) => s.project);
  const activePageId = useEditorStore((s) => s.activePageId);

  const html = useMemo(() => {
    if (!project) return "";
    const page = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
    if (!page) return "";
    return generatePagePreview(page, project);
  }, [project, activePageId]);

  if (!html) return null;

  return (
    <div className="flex flex-col h-full border-l border-[#e2e8f0] bg-white" style={{ minWidth: 360, maxWidth: 640, flex: "0 0 480px" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2e8f0] bg-[#f8fafc] shrink-0">
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Live Preview</span>
        <span className="text-[10px] text-[#94a3b8]">Updates on change</span>
      </div>
      <iframe
        className="flex-1 w-full border-0"
        srcDoc={html}
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
