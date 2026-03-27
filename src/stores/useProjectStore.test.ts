import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "./useProjectStore";
import { createNewProject, createNewPage, createNewSection } from "../types/project";
import { nanoid } from "../types/nanoid";
import type { Block } from "../types/blocks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freshProject() {
  return createNewProject("Test", "A test project");
}

function freshBlock(type: Block["type"] = "heading"): Block {
  return {
    id: nanoid(),
    type,
    props: { text: "Hello", level: 2, align: "left" },
  } as Block;
}

function resetStore(project = freshProject()) {
  useProjectStore.getState().setProject(project);
}

// ─── setProject / clearProject ───────────────────────────────────────────────

describe("setProject / clearProject", () => {
  it("setProject loads a project and clears history", () => {
    resetStore();
    const state = useProjectStore.getState();
    expect(state.project).not.toBeNull();
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
    expect(state.isDirty).toBe(false);
  });

  it("clearProject nulls out project", () => {
    resetStore();
    useProjectStore.getState().clearProject();
    expect(useProjectStore.getState().project).toBeNull();
  });
});

// ─── updateProjectMeta ───────────────────────────────────────────────────────

describe("updateProjectMeta", () => {
  beforeEach(() => resetStore());

  it("updates project name", () => {
    useProjectStore.getState().updateProjectMeta({ name: "New Name" });
    expect(useProjectStore.getState().project?.name).toBe("New Name");
  });

  it("marks project as dirty", () => {
    useProjectStore.getState().updateProjectMeta({ name: "Dirty" });
    expect(useProjectStore.getState().isDirty).toBe(true);
  });

  it("updates author and tags", () => {
    useProjectStore.getState().updateProjectMeta({ author: "Alice", tags: ["portfolio", "blog"] });
    const p = useProjectStore.getState().project!;
    expect(p.author).toBe("Alice");
    expect(p.tags).toEqual(["portfolio", "blog"]);
  });
});

// ─── Pages ───────────────────────────────────────────────────────────────────

describe("addPage / updatePage / deletePage", () => {
  beforeEach(() => resetStore());

  it("addPage adds a page to the project", () => {
    const before = useProjectStore.getState().project!.pages.length;
    useProjectStore.getState().addPage(createNewPage("About", 1));
    expect(useProjectStore.getState().project!.pages).toHaveLength(before + 1);
  });

  it("addPage pushes to past history", () => {
    useProjectStore.getState().addPage(createNewPage("About", 1));
    expect(useProjectStore.getState().past.length).toBeGreaterThan(0);
  });

  it("updatePage changes page name", () => {
    const pageId = useProjectStore.getState().project!.pages[0].id;
    useProjectStore.getState().updatePage(pageId, { name: "Updated Home" });
    const page = useProjectStore.getState().project!.pages.find((p) => p.id === pageId);
    expect(page?.name).toBe("Updated Home");
  });

  it("deletePage removes the page", () => {
    useProjectStore.getState().addPage(createNewPage("Contact", 1));
    const pages = useProjectStore.getState().project!.pages;
    const targetId = pages[pages.length - 1].id;
    useProjectStore.getState().deletePage(targetId);
    expect(useProjectStore.getState().project!.pages.find((p) => p.id === targetId)).toBeUndefined();
  });
});

// ─── Sections ────────────────────────────────────────────────────────────────

describe("addSection / updateSection / deleteSection / duplicateSection", () => {
  beforeEach(() => resetStore());

  function getPageId() {
    return useProjectStore.getState().project!.pages[0].id;
  }

  it("addSection adds a section to the page", () => {
    const pageId = getPageId();
    useProjectStore.getState().addSection(pageId, createNewSection());
    const sections = useProjectStore.getState().project!.pages[0].sections;
    expect(sections).toHaveLength(1);
  });

  it("updateSection updates paddingTop", () => {
    const pageId = getPageId();
    const section = createNewSection();
    useProjectStore.getState().addSection(pageId, section);
    useProjectStore.getState().updateSection(pageId, section.id, { paddingTop: 128 });
    const updated = useProjectStore.getState().project!.pages[0].sections.find((s) => s.id === section.id);
    expect(updated?.paddingTop).toBe(128);
  });

  it("deleteSection removes the section", () => {
    const pageId = getPageId();
    const section = createNewSection();
    useProjectStore.getState().addSection(pageId, section);
    useProjectStore.getState().deleteSection(pageId, section.id);
    expect(useProjectStore.getState().project!.pages[0].sections).toHaveLength(0);
  });

  it("duplicateSection creates a copy with a different ID", () => {
    const pageId = getPageId();
    const section = createNewSection();
    useProjectStore.getState().addSection(pageId, section);
    useProjectStore.getState().duplicateSection(pageId, section.id);
    const sections = useProjectStore.getState().project!.pages[0].sections;
    expect(sections).toHaveLength(2);
    expect(sections[0].id).not.toBe(sections[1].id);
  });
});

// ─── Global section sync ──────────────────────────────────────────────────────

describe("updateSection global sync", () => {
  it("syncs changes across pages when isGlobal=true", () => {
    const project = freshProject();
    const globalId = nanoid();

    const section1 = { ...createNewSection(), isGlobal: true, globalId };
    const section2 = { ...createNewSection(), isGlobal: true, globalId };

    const page1 = createNewPage("Page 1", 0);
    page1.sections = [section1];
    const page2 = createNewPage("Page 2", 1);
    page2.sections = [section2];

    useProjectStore.getState().setProject({ ...project, pages: [page1, page2] });
    const pageId = page1.id;

    useProjectStore.getState().updateSection(pageId, section1.id, { paddingTop: 999 });

    const state = useProjectStore.getState().project!;
    const s1 = state.pages[0].sections[0];
    const s2 = state.pages[1].sections[0];

    expect(s1.paddingTop).toBe(999);
    expect(s2.paddingTop).toBe(999);
  });
});

// ─── Blocks ───────────────────────────────────────────────────────────────────

describe("addBlock / updateBlock / deleteBlock / deleteBlocks / duplicateBlock", () => {
  let pageId: string;
  let sectionId: string;

  beforeEach(() => {
    const project = freshProject();
    const section = createNewSection();
    const page = project.pages[0];
    page.sections = [section];
    useProjectStore.getState().setProject({ ...project, pages: [page] });
    pageId = page.id;
    sectionId = section.id;
  });

  it("addBlock adds a block to the section", () => {
    const block = freshBlock();
    useProjectStore.getState().addBlock(pageId, sectionId, block);
    const blocks = useProjectStore.getState().project!.pages[0].sections[0].blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe(block.id);
  });

  it("updateBlock updates block props", () => {
    const block = freshBlock();
    useProjectStore.getState().addBlock(pageId, sectionId, block);
    useProjectStore.getState().updateBlock(pageId, sectionId, block.id, { text: "Updated" });
    const updated = useProjectStore.getState().project!.pages[0].sections[0].blocks[0];
    expect((updated.props as unknown as Record<string, unknown>).text).toBe("Updated");
  });

  it("deleteBlock removes the block", () => {
    const block = freshBlock();
    useProjectStore.getState().addBlock(pageId, sectionId, block);
    useProjectStore.getState().deleteBlock(pageId, sectionId, block.id);
    expect(useProjectStore.getState().project!.pages[0].sections[0].blocks).toHaveLength(0);
  });

  it("deleteBlocks removes multiple blocks at once", () => {
    const b1 = freshBlock();
    const b2 = freshBlock();
    const b3 = freshBlock();
    useProjectStore.getState().addBlock(pageId, sectionId, b1);
    useProjectStore.getState().addBlock(pageId, sectionId, b2);
    useProjectStore.getState().addBlock(pageId, sectionId, b3);
    useProjectStore.getState().deleteBlocks(pageId, sectionId, [b1.id, b3.id]);
    const blocks = useProjectStore.getState().project!.pages[0].sections[0].blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe(b2.id);
  });

  it("duplicateBlock creates a copy with a different ID", () => {
    const block = freshBlock();
    useProjectStore.getState().addBlock(pageId, sectionId, block);
    useProjectStore.getState().duplicateBlock(pageId, sectionId, block.id);
    const blocks = useProjectStore.getState().project!.pages[0].sections[0].blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[0].id).not.toBe(blocks[1].id);
  });
});

// ─── Undo / Redo ─────────────────────────────────────────────────────────────

describe("undo / redo", () => {
  beforeEach(() => resetStore());

  it("undo reverts last change", () => {
    const before = useProjectStore.getState().project!.pages.length;
    useProjectStore.getState().addPage(createNewPage("Contact", 1));
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project!.pages).toHaveLength(before);
  });

  it("redo re-applies reverted change", () => {
    const before = useProjectStore.getState().project!.pages.length;
    useProjectStore.getState().addPage(createNewPage("Contact", 1));
    useProjectStore.getState().undo();
    useProjectStore.getState().redo();
    expect(useProjectStore.getState().project!.pages).toHaveLength(before + 1);
  });

  it("undo does nothing when no history", () => {
    const nameBefore = useProjectStore.getState().project!.name;
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project!.name).toBe(nameBefore);
  });

});

// ─── updateTheme ──────────────────────────────────────────────────────────────

describe("updateTheme", () => {
  beforeEach(() => resetStore());

  it("updates the project theme", () => {
    const newTheme = { ...useProjectStore.getState().project!.theme, primaryColor: "#ff0000" };
    useProjectStore.getState().updateTheme(newTheme);
    expect(useProjectStore.getState().project!.theme.primaryColor).toBe("#ff0000");
  });

  it("marks project as dirty", () => {
    const theme = useProjectStore.getState().project!.theme;
    useProjectStore.getState().updateTheme(theme);
    expect(useProjectStore.getState().isDirty).toBe(true);
  });
});

// ─── markClean ────────────────────────────────────────────────────────────────

describe("markClean", () => {
  it("resets isDirty to false", () => {
    resetStore();
    useProjectStore.getState().updateProjectMeta({ name: "Dirty" });
    expect(useProjectStore.getState().isDirty).toBe(true);
    useProjectStore.getState().markClean();
    expect(useProjectStore.getState().isDirty).toBe(false);
  });
});
