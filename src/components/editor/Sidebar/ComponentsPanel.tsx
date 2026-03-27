import { useDraggable } from "@dnd-kit/core";
import { BLOCK_TYPES, type BlockType } from "../../../types/blocks";
import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import { createNewSection } from "../../../types/project";
import { createDefaultBlock } from "../../../lib/blockDefaults";

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

  return (
    <div className="p-3">
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
    </div>
  );
}
