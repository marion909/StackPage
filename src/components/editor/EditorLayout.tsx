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
import { useState, useEffect, useRef } from "react";
import Topbar from "./Topbar";
import LeftSidebar from "./Sidebar/LeftSidebar";
import RightSidebar from "./Sidebar/RightSidebar";
import Canvas from "./Canvas";
import ExportDialog from "../export/ExportDialog";
import DeployDialog from "../deploy/DeployDialog";
import NetlifyDeployDialog from "../deploy/NetlifyDeployDialog";
import ThemeEditorModal from "./ThemeEditorModal";
import PreviewPane from "./PreviewPane";
import { useEditorStore } from "../../stores/useEditorStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { createNewSection } from "../../types/project";
import { createDefaultBlock } from "../../lib/blockDefaults";
import { cmd_saveProject } from "../../lib/tauri";
import type { BlockType } from "../../types/blocks";
import { BLOCK_TYPES } from "../../types/blocks";

const PALETTE_PREFIX = "palette--";

export default function EditorLayout() {
  const isExportOpen = useEditorStore((s) => s.isExportDialogOpen);
  const isDeployOpen = useEditorStore((s) => s.isDeployDialogOpen);
  const isNetlifyOpen = useEditorStore((s) => s.isNetlifyDialogOpen);
  const closeNetlify = useEditorStore((s) => s.closeNetlifyDialog);
  const isThemeOpen = useEditorStore((s) => s.isThemeEditorOpen);
  const isPreviewOpen = useEditorStore((s) => s.isPreviewOpen);

  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const markClean = useProjectStore((s) => s.markClean);
  const addBlock = useProjectStore((s) => s.addBlock);
  const addSection = useProjectStore((s) => s.addSection);
  const reorderSections = useProjectStore((s) => s.reorderSections);
  const deleteBlock = useProjectStore((s) => s.deleteBlock);
  const deleteBlocks = useProjectStore((s) => s.deleteBlocks);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);

  const [draggingPaletteType, setDraggingPaletteType] = useState<BlockType | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-save (30s debounce when dirty) ──────────────────────────────────
  useEffect(() => {
    if (!isDirty || !project?.projectFilePath) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await cmd_saveProject(project as Parameters<typeof cmd_saveProject>[0]);
        markClean();
      } catch {
        // silent — user can still save manually
      }
    }, 30_000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [isDirty, project, markClean]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = (e.target as HTMLElement).isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Undo / Redo (Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      if (isEditable) return;

      // Delete / Backspace → remove selected block(s)
      if ((e.key === "Delete" || e.key === "Backspace") && selectedSectionId && activePageId) {
        if (selectedBlockIds.length > 1) {
          e.preventDefault();
          deleteBlocks(activePageId, selectedSectionId, selectedBlockIds);
          clearSelection();
        } else if (selectedBlockId) {
          e.preventDefault();
          deleteBlock(activePageId, selectedSectionId, selectedBlockId);
          clearSelection();
        }
        return;
      }

      // Escape → deselect
      if (e.key === "Escape") {
        clearSelection();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBlockId, selectedBlockIds, selectedSectionId, activePageId, deleteBlock, deleteBlocks, clearSelection, selectBlock, undo, redo]);

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
          {isPreviewOpen && <PreviewPane />}
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
      {isNetlifyOpen && <NetlifyDeployDialog onClose={closeNetlify} />}
      {isThemeOpen && <ThemeEditorModal />}
    </DndContext>
  );
}

export { PALETTE_PREFIX };
