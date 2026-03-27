import { describe, it, expect } from "vitest";
import { exportProject, generatePagePreview } from "../../engine/export/htmlGenerator";
import { createNewProject, createNewPage, createNewSection } from "../../types/project";
import { DEFAULT_THEME } from "../../types/theme";
import { nanoid } from "../../types/nanoid";
import type { Block } from "../../types/blocks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProject(overrides: Record<string, unknown> = {}) {
  const project = createNewProject("Test Site", "A test site");
  return { ...project, theme: DEFAULT_THEME, ...overrides };
}

function makeHeadingBlock(text: string): Block {
  return {
    id: nanoid(),
    type: "heading",
    props: { text, level: 2, align: "left" },
  } as Block;
}

function makeTextBlock(text: string): Block {
  return {
    id: nanoid(),
    type: "text",
    props: { text, align: "left" },
  } as Block;
}

function makeImageBlock(src: string, alt: string): Block {
  return {
    id: nanoid(),
    type: "image",
    props: { src, alt, width: 800, height: 400, objectFit: "cover", align: "center" },
  } as Block;
}

// ─── exportProject tests ──────────────────────────────────────────────────────

describe("exportProject", () => {
  it("generates at least one HTML file per page", () => {
    const project = makeProject();
    const files = exportProject(project);
    const htmlFiles = files.filter((f) => f.relativePath.endsWith(".html"));
    expect(htmlFiles.length).toBeGreaterThanOrEqual(project.pages.length);
  });

  it("always generates css/style.css", () => {
    const project = makeProject();
    const files = exportProject(project);
    expect(files.some((f) => f.relativePath === "css/style.css")).toBe(true);
  });

  it("always generates js/script.js", () => {
    const project = makeProject();
    const files = exportProject(project);
    expect(files.some((f) => f.relativePath === "js/script.js")).toBe(true);
  });

  it("always generates sitemap.xml", () => {
    const project = makeProject();
    const files = exportProject(project);
    expect(files.some((f) => f.relativePath === "sitemap.xml")).toBe(true);
  });

  it("uses index.html for the home page slug", () => {
    const project = makeProject();
    const files = exportProject(project);
    expect(files.some((f) => f.relativePath === "index.html")).toBe(true);
  });

  it("generates non-index pages with correct slug filenames", () => {
    const project = makeProject();
    const aboutPage = createNewPage("About", 1);
    aboutPage.slug = "about";
    const updatedProject = { ...project, pages: [...project.pages, aboutPage] };
    const files = exportProject(updatedProject);
    expect(files.some((f) => f.relativePath === "about.html")).toBe(true);
  });

  it("minifies HTML when minify=true", () => {
    const project = makeProject({ exportSettings: { outputType: "html" as const, minify: true, includeProjectFile: false } });
    const files = exportProject(project);
    const indexFile = files.find((f) => f.relativePath === "index.html");
    expect(indexFile).toBeDefined();
    // minified HTML should have fewer newlines than unminified
    const minifiedNewlines = (indexFile!.content.match(/\n/g) ?? []).length;

    const normalProject = makeProject({ exportSettings: { outputType: "html" as const, minify: false, includeProjectFile: false } });
    const normalFiles = exportProject(normalProject);
    const normalIndexFile = normalFiles.find((f) => f.relativePath === "index.html");
    const normalNewlines = (normalIndexFile!.content.match(/\n/g) ?? []).length;

    expect(minifiedNewlines).toBeLessThan(normalNewlines);
  });

  it("includes project JSON when includeProjectFile=true", () => {
    const project = makeProject({ exportSettings: { outputType: "html" as const, minify: false, includeProjectFile: true } });
    const files = exportProject(project);
    expect(files.some((f) => f.relativePath === "stackpage.project.json")).toBe(true);
  });

  it("puts page title in <title> tag", () => {
    const project = makeProject();
    const pageWithTitle = { ...project.pages[0], title: "My Custom Title" };
    const updatedProject = { ...project, pages: [pageWithTitle] };
    const files = exportProject(updatedProject);
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain("<title>My Custom Title</title>");
  });

  it("includes lang attribute from project.lang", () => {
    const project = makeProject({ lang: "de" });
    const files = exportProject(project);
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain('lang="de"');
  });

  it("includes meta description when set", () => {
    const project = makeProject();
    const pageWithMeta = { ...project.pages[0], metaDescription: "My meta description." };
    const updatedProject = { ...project, pages: [pageWithMeta] };
    const files = exportProject(updatedProject);
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain('name="description"');
    expect(html).toContain("My meta description.");
  });

  it("renders heading block text in HTML output", () => {
    const section = createNewSection();
    const block = makeHeadingBlock("Hello World");
    section.blocks = [block];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain("Hello World");
  });

  it("renders text block content in HTML output", () => {
    const section = createNewSection();
    section.blocks = [makeTextBlock("Some body text here.")];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain("Some body text here.");
  });

  it("renders image block with alt text", () => {
    const section = createNewSection();
    section.blocks = [makeImageBlock("https://example.com/img.jpg", "A test image")];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toContain('alt="A test image"');
    expect(html).toContain("https://example.com/img.jpg");
  });

  it("wraps navigation block in <header>", () => {
    const section = createNewSection();
    section.blocks = [{
      id: nanoid(),
      type: "navigation",
      props: { logoText: "Logo", logoType: "text", logoImageSrc: "", links: [], backgroundColor: "#ffffff", textColor: "#000000", sticky: false, showMobileMenu: false },
    } as Block];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toMatch(/<header[^>]*>/);
  });

  it("wraps footer block in <footer>", () => {
    const section = createNewSection();
    section.blocks = [{
      id: nanoid(),
      type: "footer",
      props: { companyName: "My Co", copyrightText: "© 2024", links: [], backgroundColor: "#1e293b", textColor: "#ffffff", align: "center", paddingTop: 48, paddingBottom: 48 },
    } as Block];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toMatch(/<footer[^>]*>/);
  });

  it("wraps regular sections in <section>", () => {
    const section = createNewSection();
    section.blocks = [makeHeadingBlock("Regular section")];

    const project = makeProject();
    const page = { ...project.pages[0], sections: [section] };
    const files = exportProject({ ...project, pages: [page] });
    const html = files.find((f) => f.relativePath === "index.html")!.content;
    expect(html).toMatch(/<section[^>]*>/);
  });

  it("sitemap contains page URLs when siteUrl is set", () => {
    const project = makeProject({ siteUrl: "https://example.com" });
    const about = createNewPage("About", 1);
    about.slug = "about";
    const updated = { ...project, pages: [...project.pages, about] };
    const files = exportProject(updated);
    const sitemap = files.find((f) => f.relativePath === "sitemap.xml")!.content;
    expect(sitemap).toContain("https://example.com");
    expect(sitemap).toContain("about.html");
  });
});

// ─── generatePagePreview tests ────────────────────────────────────────────────

describe("generatePagePreview", () => {
  it("returns a complete HTML document", () => {
    const project = makeProject();
    const html = generatePagePreview(project.pages[0], project);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("inlines CSS instead of linking to external stylesheet", () => {
    const project = makeProject();
    const html = generatePagePreview(project.pages[0], project);
    expect(html).toContain("<style>");
    expect(html).not.toContain('href="css/style.css"');
  });
});
