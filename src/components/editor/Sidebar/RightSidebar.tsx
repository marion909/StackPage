import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import PropertiesPanel from "./PropertiesPanel";

export default function RightSidebar() {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const activePageId = useEditorStore((s) => s.activePageId);
  const project = useProjectStore((s) => s.project);

  const selectedBlock =
    selectedBlockId && selectedSectionId && activePageId
      ? project?.pages
          .find((p) => p.id === activePageId)
          ?.sections.find((sec) => sec.id === selectedSectionId)
          ?.blocks.find((b) => b.id === selectedBlockId) ?? null
      : null;

  return (
    <aside className="w-64 bg-white border-l border-[#e2e8f0] flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0] shrink-0">
        <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          {selectedBlock ? "Properties" : "Inspector"}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedBlock && selectedSectionId && activePageId ? (
          <PropertiesPanel
            block={selectedBlock}
            pageId={activePageId}
            sectionId={selectedSectionId}
          />
        ) : (
          <div className="p-4 text-xs text-[#94a3b8] text-center mt-8">
            Click a block to see its properties
          </div>
        )}
      </div>
    </aside>
  );
}
