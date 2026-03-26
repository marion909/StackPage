import { create } from "zustand";
import type { Project, Page, Section } from "../types/project";
import type { Block } from "../types/blocks";

interface ProjectState {
  project: Project | null;
  isDirty: boolean;

  setProject: (project: Project) => void;
  clearProject: () => void;
  updateProjectMeta: (updates: Partial<Pick<Project, "name" | "description">>) => void;
  markClean: () => void;

  // Pages
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Omit<Page, "id" | "sections">>) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (orderedIds: string[]) => void;

  // Sections
  addSection: (pageId: string, section: Section) => void;
  updateSection: (pageId: string, sectionId: string, updates: Partial<Omit<Section, "id">>) => void;
  deleteSection: (pageId: string, sectionId: string) => void;
  reorderSections: (pageId: string, orderedIds: string[]) => void;

  // Blocks
  addBlock: (pageId: string, sectionId: string, block: Block) => void;
  updateBlock: (pageId: string, sectionId: string, blockId: string, props: Partial<Block["props"]>) => void;
  deleteBlock: (pageId: string, sectionId: string, blockId: string) => void;
  reorderBlocks: (pageId: string, sectionId: string, orderedIds: string[]) => void;
}

function touch(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  isDirty: false,

  setProject: (project) => set({ project, isDirty: false }),
  clearProject: () => set({ project: null, isDirty: false }),
  markClean: () => set({ isDirty: false }),

  updateProjectMeta: (updates) =>
    set((s) =>
      s.project ? { project: touch({ ...s.project, ...updates }), isDirty: true } : s
    ),

  // ─── Pages ────────────────────────────────────────────────────────────────
  addPage: (page) =>
    set((s) =>
      s.project
        ? { project: touch({ ...s.project, pages: [...s.project.pages, page] }), isDirty: true }
        : s
    ),

  updatePage: (pageId, updates) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
            }),
            isDirty: true,
          }
        : s
    ),

  deletePage: (pageId) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.filter((p) => p.id !== pageId),
            }),
            isDirty: true,
          }
        : s
    ),

  reorderPages: (orderedIds) =>
    set((s) => {
      if (!s.project) return s;
      const map = new Map(s.project.pages.map((p) => [p.id, p]));
      const reordered = orderedIds.map((id, i) => ({ ...map.get(id)!, order: i })).filter(Boolean);
      return { project: touch({ ...s.project, pages: reordered }), isDirty: true };
    }),

  // ─── Sections ─────────────────────────────────────────────────────────────
  addSection: (pageId, section) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId ? { ...p, sections: [...p.sections, section] } : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  updateSection: (pageId, sectionId, updates) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId
                  ? {
                      ...p,
                      sections: p.sections.map((sec) =>
                        sec.id === sectionId ? { ...sec, ...updates } : sec
                      ),
                    }
                  : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  deleteSection: (pageId, sectionId) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId
                  ? { ...p, sections: p.sections.filter((sec) => sec.id !== sectionId) }
                  : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  reorderSections: (pageId, orderedIds) =>
    set((s) => {
      if (!s.project) return s;
      return {
        project: touch({
          ...s.project,
          pages: s.project.pages.map((p) => {
            if (p.id !== pageId) return p;
            const map = new Map(p.sections.map((sec) => [sec.id, sec]));
            return {
              ...p,
              sections: orderedIds.map((id) => map.get(id)!).filter(Boolean),
            };
          }),
        }),
        isDirty: true,
      };
    }),

  // ─── Blocks ───────────────────────────────────────────────────────────────
  addBlock: (pageId, sectionId, block) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId
                  ? {
                      ...p,
                      sections: p.sections.map((sec) =>
                        sec.id === sectionId ? { ...sec, blocks: [...sec.blocks, block] } : sec
                      ),
                    }
                  : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  updateBlock: (pageId, sectionId, blockId, props) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId
                  ? {
                      ...p,
                      sections: p.sections.map((sec) =>
                        sec.id === sectionId
                          ? {
                              ...sec,
                              blocks: sec.blocks.map((b) =>
                                b.id === blockId
                                  ? ({ ...b, props: { ...b.props, ...props } } as Block)
                                  : b
                              ),
                            }
                          : sec
                      ),
                    }
                  : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  deleteBlock: (pageId, sectionId, blockId) =>
    set((s) =>
      s.project
        ? {
            project: touch({
              ...s.project,
              pages: s.project.pages.map((p) =>
                p.id === pageId
                  ? {
                      ...p,
                      sections: p.sections.map((sec) =>
                        sec.id === sectionId
                          ? { ...sec, blocks: sec.blocks.filter((b) => b.id !== blockId) }
                          : sec
                      ),
                    }
                  : p
              ),
            }),
            isDirty: true,
          }
        : s
    ),

  reorderBlocks: (pageId, sectionId, orderedIds) =>
    set((s) => {
      if (!s.project) return s;
      return {
        project: touch({
          ...s.project,
          pages: s.project.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              sections: p.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const map = new Map(sec.blocks.map((b) => [b.id, b]));
                return {
                  ...sec,
                  blocks: orderedIds.map((id) => map.get(id)!).filter(Boolean),
                };
              }),
            };
          }),
        }),
        isDirty: true,
      };
    }),
}));
