import { create } from "zustand";
import type { Project, Page, Section } from "../types/project";
import type { Block } from "../types/blocks";
import type { Theme } from "../types/theme";
import { nanoid } from "../types/nanoid";

const MAX_HISTORY = 50;

interface ProjectState {
  project: Project | null;
  isDirty: boolean;
  past: Project[];
  future: Project[];

  setProject: (project: Project) => void;
  clearProject: () => void;
  updateProjectMeta: (updates: Partial<Pick<Project, "name" | "description" | "author" | "tags" | "siteUrl" | "lang" | "thumbnail">>) => void;
  markClean: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Pages
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Omit<Page, "id" | "sections">>) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (orderedIds: string[]) => void;

  // Sections
  addSection: (pageId: string, section: Section) => void;
  updateSection: (pageId: string, sectionId: string, updates: Partial<Omit<Section, "id">>) => void;
  deleteSection: (pageId: string, sectionId: string) => void;
  duplicateSection: (pageId: string, sectionId: string) => void;
  reorderSections: (pageId: string, orderedIds: string[]) => void;

  // Blocks
  addBlock: (pageId: string, sectionId: string, block: Block) => void;
  updateBlock: (pageId: string, sectionId: string, blockId: string, props: Partial<Block["props"]>) => void;
  patchBlock: (pageId: string, sectionId: string, blockId: string, patch: Partial<Pick<Block, "cornerRadius">>) => void;
  deleteBlock: (pageId: string, sectionId: string, blockId: string) => void;
  deleteBlocks: (pageId: string, sectionId: string, blockIds: string[]) => void;
  duplicateBlock: (pageId: string, sectionId: string, blockId: string) => void;
  reorderBlocks: (pageId: string, sectionId: string, orderedIds: string[]) => void;

  // Theme
  updateTheme: (theme: Theme) => void;
}

function touch(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

/** Deep-clone a block and assign a new ID (and new IDs to nested children). */
function deepCloneBlock(block: Block): Block {
  const clone = JSON.parse(JSON.stringify(block)) as Block;
  (clone as Block & { id: string }).id = nanoid();

  if (clone.type === "container") {
    clone.props.children = clone.props.children.map(deepCloneBlock);
  } else if (clone.type === "two-column") {
    clone.props.leftChildren = clone.props.leftChildren.map(deepCloneBlock);
    clone.props.rightChildren = clone.props.rightChildren.map(deepCloneBlock);
  } else if (clone.type === "three-column") {
    clone.props.col1Children = clone.props.col1Children.map(deepCloneBlock);
    clone.props.col2Children = clone.props.col2Children.map(deepCloneBlock);
    clone.props.col3Children = clone.props.col3Children.map(deepCloneBlock);
  }

  return clone;
}

function deepCloneSection(section: Section): Section {
  return {
    ...JSON.parse(JSON.stringify(section)),
    id: nanoid(),
    blocks: section.blocks.map(deepCloneBlock),
  };
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  isDirty: false,
  past: [],
  future: [],

  setProject: (project) => set({ project, isDirty: false, past: [], future: [] }),
  clearProject: () => set({ project: null, isDirty: false, past: [], future: [] }),
  markClean: () => set({ isDirty: false }),

  updateProjectMeta: (updates) =>
    set((s) =>
      s.project ? { project: touch({ ...s.project, ...updates }), isDirty: true } : s
    ),

  // ─── History ──────────────────────────────────────────────────────────────
  undo: () =>
    set((s) => {
      if (!s.project || s.past.length === 0) return s;
      const past = [...s.past];
      const previous = past.pop()!;
      return {
        project: previous,
        past,
        future: [s.project, ...s.future].slice(0, MAX_HISTORY),
        isDirty: true,
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.project || s.future.length === 0) return s;
      const [next, ...future] = s.future;
      return {
        project: next,
        past: [...s.past, s.project].slice(-MAX_HISTORY),
        future,
        isDirty: true,
      };
    }),

  // ─── Pages ────────────────────────────────────────────────────────────────
  addPage: (page) =>
    set((s) =>
      s.project
        ? { project: touch({ ...s.project, pages: [...s.project.pages, page] }), isDirty: true, past: [...s.past, s.project].slice(-MAX_HISTORY), future: [] }
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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
          }
        : s
    ),

  reorderPages: (orderedIds) =>
    set((s) => {
      if (!s.project) return s;
      const map = new Map(s.project.pages.map((p) => [p.id, p]));
      const reordered = orderedIds.map((id, i) => ({ ...map.get(id)!, order: i })).filter(Boolean);
      return { project: touch({ ...s.project, pages: reordered }), isDirty: true, past: [...s.past, s.project].slice(-MAX_HISTORY), future: [] };
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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
          }
        : s
    ),

  updateSection: (pageId, sectionId, updates) =>
    set((s) => {
      if (!s.project) return s;

      // Find the section being updated to check if it's global
      const targetSection = s.project.pages
        .flatMap((p) => p.sections)
        .find((sec) => sec.id === sectionId);
      const isGlobal = targetSection?.isGlobal && targetSection.globalId;

      return {
        project: touch({
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === pageId || (isGlobal && p.sections.some((sec) => sec.globalId === targetSection!.globalId))
              ? {
                  ...p,
                  sections: p.sections.map((sec) => {
                    // Update the specific section directly, or a global twin
                    if (sec.id === sectionId) return { ...sec, ...updates };
                    if (isGlobal && sec.globalId === targetSection!.globalId) return { ...sec, ...updates };
                    return sec;
                  }),
                }
              : p
          ),
        }),
        isDirty: true,
        past: [...s.past, s.project].slice(-MAX_HISTORY),
        future: [],
      };
    }),

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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
          }
        : s
    ),

  duplicateSection: (pageId, sectionId) =>
    set((s) => {
      if (!s.project) return s;
      const pages = s.project.pages.map((p) => {
        if (p.id !== pageId) return p;
        const idx = p.sections.findIndex((sec) => sec.id === sectionId);
        if (idx === -1) return p;
        const clone = deepCloneSection(p.sections[idx]);
        const sections = [...p.sections];
        sections.splice(idx + 1, 0, clone);
        return { ...p, sections };
      });
      return { project: touch({ ...s.project, pages }), isDirty: true, past: [...s.past, s.project].slice(-MAX_HISTORY), future: [] };
    }),

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
        past: [...s.past, s.project].slice(-MAX_HISTORY),
        future: [],
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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
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

  patchBlock: (pageId, sectionId, blockId, patch) =>
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
                                b.id === blockId ? ({ ...b, ...patch } as Block) : b
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
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
          }
        : s
    ),

  deleteBlocks: (pageId, sectionId, blockIds) =>
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
                          ? { ...sec, blocks: sec.blocks.filter((b) => !blockIds.includes(b.id)) }
                          : sec
                      ),
                    }
                  : p
              ),
            }),
            isDirty: true,
            past: [...s.past, s.project].slice(-MAX_HISTORY),
            future: [],
          }
        : s
    ),

  duplicateBlock: (pageId, sectionId, blockId) =>
    set((s) => {
      if (!s.project) return s;
      const pages = s.project.pages.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            const idx = sec.blocks.findIndex((b) => b.id === blockId);
            if (idx === -1) return sec;
            const clone = deepCloneBlock(sec.blocks[idx]);
            const blocks = [...sec.blocks];
            blocks.splice(idx + 1, 0, clone);
            return { ...sec, blocks };
          }),
        };
      });
      return { project: touch({ ...s.project, pages }), isDirty: true, past: [...s.past, s.project].slice(-MAX_HISTORY), future: [] };
    }),

  updateTheme: (theme) =>
    set((s) =>
      s.project ? { project: touch({ ...s.project, theme }), isDirty: true, past: [...s.past, s.project].slice(-MAX_HISTORY), future: [] } : s
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
        past: [...s.past, s.project].slice(-MAX_HISTORY),
        future: [],
      };
    }),
}));
