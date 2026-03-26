import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import type { Section } from "../../types/project";
import ComponentBlock from "./ComponentBlock";

interface Props {
  section: Section;
  pageId: string;
}

export default function SectionBlock({ section, pageId }: Props) {
  const [hover, setHover] = useState(false);
  const deleteSection = useProjectStore((s) => s.deleteSection);
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
      {/* Section toolbar */}
      {(hover || isSelected) && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-[#2563eb] z-10">
          <div className="flex items-center gap-2">
            <button
              {...listeners}
              {...attributes}
              className="text-white/70 hover:text-white cursor-grab text-xs"
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              ⠿ Section
            </button>
            {section.label && (
              <span className="text-white/70 text-xs">{section.label}</span>
            )}
          </div>
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
      )}

      {/* Section content */}
      <div
        style={{
          backgroundColor: section.backgroundColor,
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
          {section.blocks.length === 0 ? (
            <div className="border border-dashed border-[#e2e8f0] rounded-lg py-8 text-center text-xs text-[#94a3b8]">
              Drop components here or use the Components panel
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {section.blocks.map((block) => (
                <ComponentBlock
                  key={block.id}
                  block={block}
                  pageId={pageId}
                  sectionId={section.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
