import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import PropertiesPanel from "./PropertiesPanel";
import SectionPropertiesPanel from "./SectionPropertiesPanel";

export default function RightSidebar() {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const activePageId = useEditorStore((s) => s.activePageId);
  const project = useProjectStore((s) => s.project);

  const activePage = activePageId
    ? project?.pages.find((p) => p.id === activePageId) ?? null
    : null;

  const selectedSection =
    selectedSectionId && activePage
      ? activePage.sections.find((sec) => sec.id === selectedSectionId) ?? null
      : null;

  const selectedBlock =
    selectedBlockId && selectedSection
      ? selectedSection.blocks.find((b) => b.id === selectedBlockId) ?? null
      : null;

  const title = selectedBlock ? "Properties" : selectedSection ? "Section" : "Inspector";

  return (
    <aside className="w-64 bg-white border-l border-[#e2e8f0] flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0] shrink-0">
        <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedBlock && selectedSectionId && activePageId ? (
          <PropertiesPanel
            block={selectedBlock}
            pageId={activePageId}
            sectionId={selectedSectionId}
          />
        ) : selectedSection && activePageId ? (
          <SectionPropertiesPanel section={selectedSection} pageId={activePageId} />
        ) : (
          <div className="p-4 text-xs text-[#94a3b8] text-center mt-8">
            Click a block or section to see its properties
          </div>
        )}
      </div>
    </aside>
  );
}
