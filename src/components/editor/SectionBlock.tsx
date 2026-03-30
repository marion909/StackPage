import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import type { Section } from "../../types/project";
import ComponentBlock from "./ComponentBlock";
import { nanoid } from "../../types/nanoid";

interface Props {
  section: Section;
  pageId: string;
}

/** Listens to the OUTER DndContext to detect palette-drag-over-this-section */
function PaletteDropIndicator({ sectionId }: { sectionId: string }) {
  const [isOver, setIsOver] = useState(false);
  useDndMonitor({
    onDragOver(event) {
      const overId = event.over ? String(event.over.id) : null;
      const activeId = String(event.active.id);
      // Show indicator if a palette item is hovering over this section or any block in it
      setIsOver(activeId.startsWith("palette--") && overId === sectionId);
    },
    onDragEnd() { setIsOver(false); },
    onDragCancel() { setIsOver(false); },
  });
  if (!isOver) return null;
  return (
    <div className="absolute inset-0 bg-[#2563eb]/10 border-2 border-dashed border-[#2563eb] rounded pointer-events-none z-20 flex items-center justify-center">
      <span className="text-[#2563eb] text-sm font-medium bg-white px-3 py-1 rounded shadow">Drop here</span>
    </div>
  );
}

function BlocksSortable({ section, pageId }: { section: Section; pageId: string }) {
  const reorderBlocks = useProjectStore((s) => s.reorderBlocks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = section.blocks.map((b) => b.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(newIdx, 0, reordered.splice(oldIdx, 1)[0]);
    reorderBlocks(pageId, section.id, reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={section.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {section.blocks.map((block) => (
            <ComponentBlock key={block.id} block={block} pageId={pageId} sectionId={section.id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function SectionBlock({ section, pageId }: Props) {
  const [hover, setHover] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const deleteSection = useProjectStore((s) => s.deleteSection);
  const duplicateSection = useProjectStore((s) => s.duplicateSection);
  const updateSection = useProjectStore((s) => s.updateSection);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedSectionId === section.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 transition-colors ${
        isSelected ? "border-[#2563eb]" : hover ? "border-[#bfdbfe]" : "border-transparent"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => selectBlock(null, section.id)}
    >
      <PaletteDropIndicator sectionId={section.id} />

      {/* Section toolbar */}
      {(hover || isSelected) && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-[#2563eb] z-10">
          <div className="flex items-center gap-2">
            <button
              {...listeners}
              {...attributes}
              className="text-white/70 hover:text-white cursor-grab text-xs"
              title="Drag to reorder section"
              onClick={(e) => e.stopPropagation()}
            >
              ⠿ Section
            </button>
            {section.label && (
              <span className="text-white/70 text-xs">{section.label}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateSection(pageId, section.id);
              }}
              className="text-white/70 hover:text-white text-xs px-1"
              title="Duplicate section"
            >
              ⧉
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const gId = section.globalId ?? nanoid();
                updateSection(pageId, section.id, {
                  isGlobal: !section.isGlobal,
                  globalId: !section.isGlobal ? gId : undefined,
                });
              }}
              className={`text-xs px-1 ${section.isGlobal ? "text-yellow-300 hover:text-white" : "text-white/70 hover:text-white"}`}
              title={section.isGlobal ? "Unlink global section" : "Make global (sync across all pages)"}
            >
              {section.isGlobal ? "★" : "☆"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed((c) => !c);
              }}
              className="text-white/70 hover:text-white text-xs px-1"
              title={collapsed ? "Expand section" : "Collapse section"}
            >
              {collapsed ? "▾" : "▴"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this section?")) deleteSection(pageId, section.id);
              }}
              className="text-white/70 hover:text-white text-xs"
              title="Delete section"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Section content */}
      <div
        style={{
          backgroundColor: section.backgroundGradient ? undefined : section.backgroundColor,
          background: section.backgroundGradient ?? undefined,
          backgroundImage: !section.backgroundGradient && section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: `${section.paddingTop}px`,
          paddingBottom: `${section.paddingBottom}px`,
          paddingLeft: `${section.paddingLeft}px`,
          paddingRight: `${section.paddingRight}px`,
        }}
      >
        <div
          style={{
            maxWidth: section.fullWidth ? "none" : `${section.maxWidth ?? 1200}px`,
            margin: "0 auto",
          }}
        >
          {collapsed ? (
            <div className="py-2 text-center text-xs text-[#94a3b8] italic">
              {section.blocks.length} block{section.blocks.length !== 1 ? "s" : ""} (collapsed)
            </div>
          ) : section.blocks.length === 0 ? (
            <div className="border border-dashed border-[#e2e8f0] rounded-lg py-8 text-center text-xs text-[#94a3b8]">
              Drop components here or click in the Components panel
            </div>
          ) : (
            <BlocksSortable section={section} pageId={pageId} />
          )}
        </div>
      </div>
    </div>
  );
}
