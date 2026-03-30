import { create } from "zustand";
import type { Block } from "../types/blocks";

export type AppView = "dashboard" | "editor";
export type PreviewMode = "desktop" | "tablet" | "mobile";
export type LeftSidebarTab = "pages" | "components";

interface EditorState {
  view: AppView;
  activePageId: string | null;
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  /** IDs of all currently selected blocks (for multi-select). Includes selectedBlockId. */
  selectedBlockIds: string[];
  previewMode: PreviewMode;
  leftSidebarTab: LeftSidebarTab;
  isExportDialogOpen: boolean;
  isDeployDialogOpen: boolean;
  isNetlifyDialogOpen: boolean;
  isThemeEditorOpen: boolean;
  isPreviewOpen: boolean;
  isSaving: boolean;
  /** Block copied to clipboard for paste operation. */
  copiedBlock: Block | null;
  /** Canvas zoom level (0.5–2.0, default 1.0). */
  canvasZoom: number;

  setView: (view: AppView) => void;
  setActivePageId: (id: string | null) => void;
  selectBlock: (blockId: string | null, sectionId: string | null) => void;
  /** Shift-click: toggle a block in/out of the multi-selection (must be in same section). */
  toggleBlockSelection: (blockId: string, sectionId: string) => void;
  clearSelection: () => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setLeftSidebarTab: (tab: LeftSidebarTab) => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openDeployDialog: () => void;
  closeDeployDialog: () => void;
  openNetlifyDialog: () => void;
  closeNetlifyDialog: () => void;
  openThemeEditor: () => void;
  closeThemeEditor: () => void;
  togglePreview: () => void;
  setSaving: (v: boolean) => void;
  copyBlock: (block: Block) => void;
  pasteBlock: (pageId: string, sectionId: string) => void;
  setCanvasZoom: (zoom: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  view: "dashboard",
  activePageId: null,
  selectedBlockId: null,
  selectedSectionId: null,
  selectedBlockIds: [],
  previewMode: "desktop",
  leftSidebarTab: "components",
  isExportDialogOpen: false,
  isDeployDialogOpen: false,
  isNetlifyDialogOpen: false,
  isThemeEditorOpen: false,
  isPreviewOpen: false,
  isSaving: false,
  copiedBlock: null,
  canvasZoom: 1,

  setView: (view) => set({ view }),
  setActivePageId: (id) => set({ activePageId: id, selectedBlockId: null, selectedSectionId: null, selectedBlockIds: [] }),

  selectBlock: (blockId, sectionId) =>
    set({
      selectedBlockId: blockId,
      selectedSectionId: sectionId,
      selectedBlockIds: blockId ? [blockId] : [],
    }),

  toggleBlockSelection: (blockId, sectionId) =>
    set((s) => {
      // Only allow multi-select within the same section
      if (s.selectedSectionId && s.selectedSectionId !== sectionId) {
        return { selectedBlockId: blockId, selectedSectionId: sectionId, selectedBlockIds: [blockId] };
      }
      const already = s.selectedBlockIds.includes(blockId);
      const newIds = already
        ? s.selectedBlockIds.filter((id) => id !== blockId)
        : [...s.selectedBlockIds, blockId];
      return {
        selectedBlockId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
        selectedSectionId: newIds.length > 0 ? sectionId : null,
        selectedBlockIds: newIds,
      };
    }),

  clearSelection: () => set({ selectedBlockId: null, selectedSectionId: null, selectedBlockIds: [] }),

  setPreviewMode: (mode) => set({ previewMode: mode }),
  setLeftSidebarTab: (tab) => set({ leftSidebarTab: tab }),
  openExportDialog: () => set({ isExportDialogOpen: true }),
  closeExportDialog: () => set({ isExportDialogOpen: false }),
  openDeployDialog: () => set({ isDeployDialogOpen: true }),
  closeDeployDialog: () => set({ isDeployDialogOpen: false }),
  openNetlifyDialog: () => set({ isNetlifyDialogOpen: true }),
  closeNetlifyDialog: () => set({ isNetlifyDialogOpen: false }),
  openThemeEditor: () => set({ isThemeEditorOpen: true }),
  closeThemeEditor: () => set({ isThemeEditorOpen: false }),
  togglePreview: () => set((s) => ({ isPreviewOpen: !s.isPreviewOpen })),
  setSaving: (v) => set({ isSaving: v }),
  copyBlock: (block) => set({ copiedBlock: block }),
  pasteBlock: (_pageId, _sectionId) => {
    // Paste is handled in EditorLayout which has access to both stores
  },
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.min(2, Math.max(0.25, zoom)) }),
}));
