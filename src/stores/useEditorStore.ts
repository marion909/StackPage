import { create } from "zustand";

export type AppView = "dashboard" | "editor";
export type PreviewMode = "desktop" | "tablet" | "mobile";
export type LeftSidebarTab = "pages" | "components";

interface EditorState {
  view: AppView;
  activePageId: string | null;
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  previewMode: PreviewMode;
  leftSidebarTab: LeftSidebarTab;
  isExportDialogOpen: boolean;
  isDeployDialogOpen: boolean;
  isThemeEditorOpen: boolean;
  isSaving: boolean;

  setView: (view: AppView) => void;
  setActivePageId: (id: string | null) => void;
  selectBlock: (blockId: string | null, sectionId: string | null) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setLeftSidebarTab: (tab: LeftSidebarTab) => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openDeployDialog: () => void;
  closeDeployDialog: () => void;
  openThemeEditor: () => void;
  closeThemeEditor: () => void;
  setSaving: (v: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  view: "dashboard",
  activePageId: null,
  selectedBlockId: null,
  selectedSectionId: null,
  previewMode: "desktop",
  leftSidebarTab: "components",
  isExportDialogOpen: false,
  isDeployDialogOpen: false,
  isThemeEditorOpen: false,
  isSaving: false,

  setView: (view) => set({ view }),
  setActivePageId: (id) => set({ activePageId: id, selectedBlockId: null, selectedSectionId: null }),
  selectBlock: (blockId, sectionId) => set({ selectedBlockId: blockId, selectedSectionId: sectionId }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setLeftSidebarTab: (tab) => set({ leftSidebarTab: tab }),
  openExportDialog: () => set({ isExportDialogOpen: true }),
  closeExportDialog: () => set({ isExportDialogOpen: false }),
  openDeployDialog: () => set({ isDeployDialogOpen: true }),
  closeDeployDialog: () => set({ isDeployDialogOpen: false }),
  openThemeEditor: () => set({ isThemeEditorOpen: true }),
  closeThemeEditor: () => set({ isThemeEditorOpen: false }),
  setSaving: (v) => set({ isSaving: v }),
}));
