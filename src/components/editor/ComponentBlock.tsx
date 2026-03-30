import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { usePresetsStore } from "../../stores/usePresetsStore";
import { useThemeStore } from "../../stores/useThemeStore";
import type { Block } from "../../types/blocks";
import BlockRenderer from "../blocks/BlockRenderer";

interface Props {
  block: Block;
  pageId: string;
  sectionId: string;
}

export default function ComponentBlock({ block, pageId, sectionId }: Props) {
  const [hover, setHover] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctxMenu) return;
    function close(e: MouseEvent) {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [ctxMenu]);
  const deleteBlock = useProjectStore((s) => s.deleteBlock);
  const duplicateBlock = useProjectStore((s) => s.duplicateBlock);
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const toggleBlockSelection = useEditorStore((s) => s.toggleBlockSelection);
  const savePreset = usePresetsStore((s) => s.savePreset);
  const copyBlock = useEditorStore((s) => s.copyBlock);

  const isSelected = selectedBlockIds.includes(block.id);
  const isPrimary = selectedBlockId === block.id;
  const theme = useThemeStore((s) => s.theme);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const cornerRadius = block.cornerRadius ?? theme.borderRadius;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderRadius: `${cornerRadius}px`,
    overflow: "hidden" as const,
    minHeight: "20px",
  };

  function handlePropChange(props: Partial<Block["props"]>) {
    updateBlock(pageId, sectionId, block.id, props);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded transition-colors cursor-pointer ${
        isSelected
          ? isPrimary
            ? "border-[#2563eb]"
            : "border-[#93c5fd]"
          : hover
          ? "border-[#bfdbfe]"
          : "border-transparent"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selectBlock(block.id, sectionId);
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.shiftKey) {
          toggleBlockSelection(block.id, sectionId);
        } else {
          selectBlock(block.id, sectionId);
        }
      }}
    >
      {/* Block toolbar */}
      {(hover || isSelected) && (
        <div className="absolute top-0 right-0 flex items-center gap-1 bg-[#2563eb] text-white text-xs px-2 py-0.5 rounded-bl z-10">
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
          {block.notes && (
            <span className="opacity-80" title={block.notes}>📝</span>
          )}
          {selectedBlockIds.length > 1 && isPrimary && (
            <span className="opacity-70 ml-0.5">[{selectedBlockIds.length}]</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(pageId, sectionId, block.id);
            }}
            className="opacity-70 hover:opacity-100 ml-1"
            title="Duplicate"
          >
            ⧉
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const name = window.prompt("Preset name:", block.type);
              if (name) savePreset(name.trim() || block.type, block);
            }}
            className="opacity-70 hover:opacity-100 ml-0.5"
            title="Save as preset"
          >
            ☆
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(pageId, sectionId, block.id);
            }}
            className="opacity-70 hover:opacity-100 ml-0.5"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}

      <BlockRenderer block={block} onPropChange={handlePropChange} isEditing />

      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          style={{ position: "fixed", top: ctxMenu.y, left: ctxMenu.x, zIndex: 9999 }}
          className="bg-white border border-[#e2e8f0] rounded-lg shadow-xl py-1 min-w-[160px] text-sm text-[#1e293b]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {[
            {
              label: "Copy", icon: "⧉", action: () => { copyBlock(block); setCtxMenu(null); }
            },
            {
              label: "Duplicate", icon: "⊕", action: () => { duplicateBlock(pageId, sectionId, block.id); setCtxMenu(null); }
            },
            {
              label: "Save as Preset", icon: "☆", action: () => {
                const name = window.prompt("Preset name:", block.type);
                if (name) savePreset(name.trim() || block.type, block);
                setCtxMenu(null);
              }
            },
            { separator: true },
            {
              label: "Delete", icon: "×", danger: true,
              action: () => { deleteBlock(pageId, sectionId, block.id); setCtxMenu(null); }
            },
          ].map((item, i) =>
            "separator" in item && item.separator ? (
              <hr key={i} className="my-1 border-[#e2e8f0]" />
            ) : (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); ("action" in item) && item.action?.(); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#f1f5f9] transition-colors ${"danger" in item && item.danger ? "text-red-500" : ""}`}
              >
                <span className="opacity-70">{"icon" in item ? item.icon : ""}</span>
                {"label" in item ? item.label : ""}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
