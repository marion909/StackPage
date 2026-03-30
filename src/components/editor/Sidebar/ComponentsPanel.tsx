import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { BLOCK_TYPES, type BlockType } from "../../../types/blocks";
import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import { createNewSection } from "../../../types/project";
import { createDefaultBlock } from "../../../lib/blockDefaults";
import { usePresetsStore } from "../../../stores/usePresetsStore";
import type { Block } from "../../../types/blocks";

const CATEGORIES = Array.from(new Set(BLOCK_TYPES.map((b) => b.category)));

interface PaletteItemProps {
  blockType: BlockType;
  label: string;
  icon: string;
  onClick: () => void;
}

function DraggablePaletteItem({ blockType, label, icon, onClick }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette--${blockType}`,
    data: { type: "palette-item", blockType },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff6ff] transition-colors text-center cursor-grab active:cursor-grabbing${isDragging ? " opacity-40" : ""}`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] text-[#374151] font-medium leading-tight">{label}</span>
    </div>
  );
}

export default function ComponentsPanel() {
  const activePageId = useEditorStore((s) => s.activePageId);
  const project = useProjectStore((s) => s.project);
  const addSection = useProjectStore((s) => s.addSection);
  const addBlock = useProjectStore((s) => s.addBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const presets = usePresetsStore((s) => s.presets);
  const deletePreset = usePresetsStore((s) => s.deletePreset);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? BLOCK_TYPES.filter((b) =>
        b.label.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
      )
    : null; // null = show all by category

  function handleAddBlock(type: BlockType) {
    if (!activePageId || !project) return;
    const page = project.pages.find((p) => p.id === activePageId);
    if (!page) return;

    // Add to last section, or create a new section first
    let sectionId: string;
    if (page.sections.length === 0) {
      const section = createNewSection();
      addSection(activePageId, section);
      sectionId = section.id;
    } else {
      sectionId = page.sections[page.sections.length - 1].id;
    }

    const block = createDefaultBlock(type);
    addBlock(activePageId, sectionId, block as any);
    selectBlock(block.id, sectionId);
  }

  function handleAddPreset(block: Block) {
    if (!activePageId || !project) return;
    const page = project.pages.find((p) => p.id === activePageId);
    if (!page) return;

    let sectionId: string;
    if (page.sections.length === 0) {
      const section = createNewSection();
      addSection(activePageId, section);
      sectionId = section.id;
    } else {
      sectionId = page.sections[page.sections.length - 1].id;
    }

    addBlock(activePageId, sectionId, block as any);
    selectBlock(block.id, sectionId);
  }

  return (
    <div className="p-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search blocks…"
        className="w-full px-2.5 py-1.5 mb-3 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-[#1e293b] bg-[#f8fafc]"
      />

      {/* Search results */}
      {filtered ? (
        <div className="mb-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#94a3b8] text-center py-4">No results</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {filtered.map((b) => (
                <DraggablePaletteItem key={b.type} blockType={b.type} label={b.label} icon={b.icon} onClick={() => handleAddBlock(b.type)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Presets */}
      {presets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
            My Presets
          </h4>
          <div className="flex flex-col gap-1">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff6ff] transition-colors group"
              >
                <button
                  className="flex-1 text-left text-xs text-[#374151] truncate"
                  onClick={() => handleAddPreset({ ...preset.block })}
                  title={`Insert "${preset.name}"`}
                >
                  ☆ {preset.name}
                </button>
                <button
                  className="text-[#94a3b8] hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                  title="Delete preset"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-4">
          <h4 className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
            {cat}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.filter((b) => b.category === cat).map((b) => (
              <DraggablePaletteItem
                key={b.type}
                blockType={b.type}
                label={b.label}
                icon={b.icon}
                onClick={() => handleAddBlock(b.type)}
              />
            ))}
          </div>
        </div>
      ))}
        </>
      )}
    </div>
  );
}
