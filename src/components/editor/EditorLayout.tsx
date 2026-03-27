import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import Topbar from "./Topbar";
import LeftSidebar from "./Sidebar/LeftSidebar";
import RightSidebar from "./Sidebar/RightSidebar";
import Canvas from "./Canvas";
import ExportDialog from "../export/ExportDialog";
import DeployDialog from "../deploy/DeployDialog";
import ThemeEditorModal from "./ThemeEditorModal";
import { useEditorStore } from "../../stores/useEditorStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { createNewSection } from "../../types/project";
import { createDefaultBlock } from "../../lib/blockDefaults";
import type { BlockType } from "../../types/blocks";
import { BLOCK_TYPES } from "../../types/blocks";

const PALETTE_PREFIX = "palette--";

export default function EditorLayout() {
  const isExportOpen = useEditorStore((s) => s.isExportDialogOpen);
  const isDeployOpen = useEditorStore((s) => s.isDeployDialogOpen);
  const isThemeOpen = useEditorStore((s) => s.isThemeEditorOpen);

  const project = useProjectStore((s) => s.project);
  const addBlock = useProjectStore((s) => s.addBlock);
  const addSection = useProjectStore((s) => s.addSection);
  const reorderSections = useProjectStore((s) => s.reorderSections);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  const [draggingPaletteType, setDraggingPaletteType] = useState<BlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith(PALETTE_PREFIX)) {
      setDraggingPaletteType(id.replace(PALETTE_PREFIX, "") as BlockType);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingPaletteType(null);

    if (!activePageId || !project) return;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    const page = project.pages.find((p) => p.id === activePageId);
    if (!page) return;

    // ── Palette drop ──────────────────────────────────────────────────────
    if (activeId.startsWith(PALETTE_PREFIX)) {
      const blockType = activeId.replace(PALETTE_PREFIX, "") as BlockType;

      // Determine target section
      let targetSectionId: string | null = null;
      if (overId) {
        if (page.sections.some((s) => s.id === overId)) {
          targetSectionId = overId;
        } else {
          // over a block — find its parent section
          for (const sec of page.sections) {
            if (sec.blocks.some((b) => b.id === overId)) {
              targetSectionId = sec.id;
              break;
            }
          }
        }
      }

      if (!targetSectionId) {
        // Dropped on canvas with no section — auto-create one
        const newSec = createNewSection();
        addSection(activePageId, newSec);
        targetSectionId = newSec.id;
      }

      const block = createDefaultBlock(blockType);
      addBlock(activePageId, targetSectionId, block);
      selectBlock(block.id, targetSectionId);
      return;
    }

    // ── Section reordering ────────────────────────────────────────────────
    if (!overId || activeId === overId) return;
    const sectionIds = page.sections.map((s) => s.id);
    if (sectionIds.includes(activeId) && sectionIds.includes(overId)) {
      const oldIdx = sectionIds.indexOf(activeId);
      const newIdx = sectionIds.indexOf(overId);
      const reordered = [...sectionIds];
      reordered.splice(newIdx, 0, reordered.splice(oldIdx, 1)[0]);
      reorderSections(activePageId, reordered);
    }
  }

  const draggingLabel = draggingPaletteType
    ? (BLOCK_TYPES.find((b) => b.type === draggingPaletteType)?.label ?? draggingPaletteType)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-[#f1f5f9]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <Canvas />
          <RightSidebar />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {draggingLabel && (
          <div className="bg-white border-2 border-[#2563eb] rounded-lg px-3 py-2 text-sm font-medium text-[#2563eb] shadow-xl pointer-events-none select-none whitespace-nowrap">
            {draggingLabel}
          </div>
        )}
      </DragOverlay>
      {isExportOpen && <ExportDialog />}
      {isDeployOpen && <DeployDialog />}
      {isThemeOpen && <ThemeEditorModal />}
    </DndContext>
  );
}

export { PALETTE_PREFIX };
