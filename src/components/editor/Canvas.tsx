import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { createNewSection } from "../../types/project";
import SectionBlock from "./SectionBlock";

const PREVIEW_WIDTHS: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function Canvas() {
  const project = useProjectStore((s) => s.project);
  const addSection = useProjectStore((s) => s.addSection);
  const reorderSections = useProjectStore((s) => s.reorderSections);
  const activePageId = useEditorStore((s) => s.activePageId);
  const previewMode = useEditorStore((s) => s.previewMode);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activePage = project?.pages.find((p) => p.id === activePageId);
  const sections = activePage?.sections ?? [];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !activePageId) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = [...sections];
    reordered.splice(newIndex, 0, reordered.splice(oldIndex, 1)[0]);
    reorderSections(activePageId, reordered.map((s) => s.id));
  }

  function handleAddSection() {
    if (!activePageId) return;
    addSection(activePageId, createNewSection());
  }

  if (!project || !activePageId) {
    return (
      <main className="flex-1 flex items-center justify-center text-[#94a3b8] text-sm">
        No project loaded
      </main>
    );
  }

  if (!activePage) {
    return (
      <main className="flex-1 flex items-center justify-center text-[#94a3b8] text-sm">
        Select a page from the left sidebar
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#f1f5f9] flex flex-col items-center py-6 px-4">
      {/* Canvas frame */}
      <div
        className="bg-white shadow-sm min-h-full transition-all duration-300"
        style={{ width: PREVIEW_WIDTHS[previewMode], maxWidth: "100%" }}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="text-5xl opacity-20">⊞</div>
            <p className="text-[#94a3b8] text-sm">
              Add components from the left sidebar, or add a new section.
            </p>
            <button
              onClick={handleAddSection}
              className="text-sm text-[#2563eb] border border-dashed border-[#bfdbfe] px-4 py-2 rounded-lg hover:bg-[#eff6ff] transition-colors"
            >
              + Add Section
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  pageId={activePageId}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {sections.length > 0 && (
          <div className="flex justify-center py-4 border-t border-dashed border-[#e2e8f0]">
            <button
              onClick={handleAddSection}
              className="text-xs text-[#64748b] hover:text-[#2563eb] border border-dashed border-[#e2e8f0] hover:border-[#bfdbfe] px-4 py-1.5 rounded transition-colors"
            >
              + Add Section
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
