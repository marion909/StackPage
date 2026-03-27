import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import type { Block } from "../../types/blocks";
import BlockRenderer from "../blocks/BlockRenderer";

interface Props {
  block: Block;
  pageId: string;
  sectionId: string;
}

export default function ComponentBlock({ block, pageId, sectionId }: Props) {
  const [hover, setHover] = useState(false);
  const deleteBlock = useProjectStore((s) => s.deleteBlock);
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const isSelected = selectedBlockId === block.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function handlePropChange(props: Partial<Block["props"]>) {
    updateBlock(pageId, sectionId, block.id, props);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded transition-colors cursor-pointer ${
        isSelected ? "border-[#2563eb]" : hover ? "border-[#bfdbfe]" : "border-transparent"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id, sectionId);
      }}
    >
      {/* Block toolbar */}
      {(hover || isSelected) && (
        <div className="absolute -top-6 right-0 flex items-center gap-1 bg-[#2563eb] text-white text-xs px-2 py-0.5 rounded-t z-10">
          {/* Drag handle */}
          <button
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="opacity-70 hover:opacity-100 cursor-grab px-0.5"
            title="Drag to reorder"
          >
            ⠿
          </button>
          <span className="opacity-70 capitalize">{block.type}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(pageId, sectionId, block.id);
            }}
            className="opacity-70 hover:opacity-100 ml-1"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}

      <BlockRenderer block={block} onPropChange={handlePropChange} isEditing />
    </div>
  );
}
