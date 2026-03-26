import type { Project, Page, Section } from "../../types/project";
import type { Block } from "../../types/blocks";
import { generateCSS } from "./cssGenerator";
import { generateJS } from "./jsGenerator";

export interface GeneratedFile {
  relativePath: string;
  content: string;
}

export function exportProject(project: Project): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const css = generateCSS(project.theme);
  const js = generateJS();

  files.push({ relativePath: "css/style.css", content: css });
  files.push({ relativePath: "js/script.js", content: js });

  // Include project file
  if (project.exportSettings.includeProjectFile) {
    const { projectFilePath: _p, ...rest } = project;
    files.push({ relativePath: "stackpage.project.json", content: JSON.stringify(rest, null, 2) });
  }

  // Generate one HTML file per page
  for (const page of project.pages) {
    const slug = page.slug === "index" ? "index" : page.slug;
    const filename = `${slug}.html`;
    files.push({ relativePath: filename, content: generatePageHTML(page, project) });
  }

  return files;
}

function generatePageHTML(page: Page, project: Project): string {
  const title = page.title ?? `${page.name} | ${project.name}`;
  const body = page.sections.map((sec) => generateSectionHTML(sec, project)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(project.theme.headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(project.theme.bodyFont)}:wght@400;600&display=swap">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${body}
<script src="js/script.js"></script>
</body>
</html>`;
}

function generateSectionHTML(section: Section, project: Project): string {
  const style = [
    section.backgroundColor ? `background-color:${section.backgroundColor}` : "",
    `padding:${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px`,
  ].filter(Boolean).join(";");

  const inner = section.blocks.map(generateBlockHTML).join("\n");
  const maxW = section.fullWidth ? "none" : `${section.maxWidth ?? project.theme.maxWidth}px`;

  return `<section style="${style}"><div style="max-width:${maxW};margin:0 auto">${inner}</div></section>`;
}

function generateBlockHTML(block: Block): string {
  switch (block.type) {
    case "heading": {
      const { text, level, align, color, fontSize, fontWeight } = block.props;
      const weightMap: Record<string, string> = { normal: "400", semibold: "600", bold: "700", extrabold: "800" };
      const defaultSizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.5rem", 4: "1.25rem", 5: "1rem", 6: "0.875rem" };
      const style = [
        `text-align:${align}`,
        color ? `color:${color}` : "",
        `font-size:${fontSize ? `${fontSize}px` : defaultSizes[level]}`,
        `font-weight:${fontWeight ? weightMap[fontWeight] : "700"}`,
        "margin:0",
      ].filter(Boolean).join(";");
      return `<h${level} style="${style}">${escHtml(text)}</h${level}>`;
    }

    case "text": {
      const { text, align, color, fontSize } = block.props;
      const style = [
        `text-align:${align}`,
        color ? `color:${color}` : "",
        fontSize ? `font-size:${fontSize}px` : "",
        "line-height:1.7",
        "margin:0",
        "white-space:pre-wrap",
      ].filter(Boolean).join(";");
      return `<p style="${style}">${escHtml(text)}</p>`;
    }

    case "button": {
      const { label, href, target, variant, align, size } = block.props;
      const paddingMap: Record<string, string> = { sm: "8px 16px", md: "12px 24px", lg: "16px 32px" };
      const fontMap: Record<string, string> = { sm: "0.875rem", md: "1rem", lg: "1.125rem" };
      const bgMap: Record<string, string> = { primary: "#2563eb", secondary: "#64748b", outline: "transparent" };
      const colorMap: Record<string, string> = { primary: "#fff", secondary: "#fff", outline: "#2563eb" };
      const borderMap: Record<string, string> = { primary: "#2563eb", secondary: "#64748b", outline: "#2563eb" };
      const style = `display:inline-block;padding:${paddingMap[size]};font-size:${fontMap[size]};font-weight:600;background:${bgMap[variant]};color:${colorMap[variant]};border:2px solid ${borderMap[variant]};border-radius:8px;text-decoration:none`;
      const alignStyle = `text-align:${align}`;
      return `<div style="${alignStyle}"><a href="${escAttr(href)}" target="${target}" style="${style}">${escHtml(label)}</a></div>`;
    }

    case "image": {
      const { src, alt, width, align, objectFit, borderRadius, caption } = block.props;
      if (!src) return "";
      const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
      const imgStyle = `width:${width}%;object-fit:${objectFit};display:block${borderRadius ? `;border-radius:${borderRadius}px` : ""}`;
      const wrapStyle = `display:flex;flex-direction:column;align-items:${alignMap[align]}`;
      const captionHtml = caption ? `<p style="font-size:0.8rem;color:#64748b;margin-top:4px;text-align:${align}">${escHtml(caption)}</p>` : "";
      return `<div style="${wrapStyle}"><img src="${escAttr(src)}" alt="${escAttr(alt)}" style="${imgStyle}">${captionHtml}</div>`;
    }

    case "navigation": {
      const { logoText, logoType, logoImageSrc, links, sticky, backgroundColor, textColor } = block.props;
      const navStyle = `background:${backgroundColor};color:${textColor};${sticky ? "position:sticky;top:0;z-index:100;" : ""}border-bottom:1px solid rgba(0,0,0,0.08)`;
      const logoHtml = logoType === "image" && logoImageSrc
        ? `<img src="${escAttr(logoImageSrc)}" alt="${escAttr(logoText)}" style="height:36px;object-fit:contain">`
        : `<span style="font-weight:700;font-size:1.125rem;color:${textColor}">${escHtml(logoText)}</span>`;
      const linksHtml = links.map((l) => `<a href="${escAttr(l.href)}" style="color:${textColor};text-decoration:none;font-size:0.9rem;font-weight:500">${escHtml(l.label)}</a>`).join("");
      return `<nav style="${navStyle}"><div style="max-width:1200px;margin:0 auto;padding:0 16px;display:flex;align-items:center;justify-content:space-between;height:64px">${logoHtml}<div style="display:flex;gap:24px;align-items:center">${linksHtml}</div></div></nav>`;
    }

    case "footer": {
      const { companyName, copyrightText, links, backgroundColor, textColor, align, paddingTop, paddingBottom } = block.props;
      const footerStyle = `background:${backgroundColor};color:${textColor};padding:${paddingTop}px 16px ${paddingBottom}px;text-align:${align}`;
      const linksHtml = links.map((l) => `<a href="${escAttr(l.href)}" style="color:${textColor};text-decoration:none;font-size:0.875rem;opacity:0.8">${escHtml(l.label)}</a>`).join("");
      const justifyMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
      const navStyle = `display:flex;gap:16px;justify-content:${justifyMap[align]};flex-wrap:wrap;margin-bottom:12px`;
      return `<footer style="${footerStyle}"><div style="max-width:1200px;margin:0 auto"><p style="font-weight:700;margin-bottom:8px">${escHtml(companyName)}</p><nav style="${navStyle}">${linksHtml}</nav><p style="font-size:0.8rem;opacity:0.6;margin:0">${escHtml(copyrightText)}</p></div></footer>`;
    }

    case "contact-form": {
      const { fields, submitLabel, backgroundColor, paddingTop, paddingBottom, recipientEmail } = block.props;
      const action = recipientEmail ? `action="mailto:${escAttr(recipientEmail)}" method="POST" enctype="text/plain"` : "";
      const formStyle = `max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px`;
      const wrapStyle = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const fieldsHtml = fields.map((f) => {
        const labelHtml = `<label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:4px">${escHtml(f.label)}${f.required ? '<span style="color:#ef4444;margin-left:2px">*</span>' : ""}</label>`;
        const inputStyle = `width:100%;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:0.9rem;box-sizing:border-box`;
        const input = f.type === "textarea"
          ? `<textarea name="${escAttr(f.id)}" placeholder="${escAttr(f.label)}" rows="4" ${f.required ? "required" : ""} style="${inputStyle}"></textarea>`
          : `<input type="${f.type}" name="${escAttr(f.id)}" placeholder="${escAttr(f.label)}" ${f.required ? "required" : ""} style="${inputStyle}">`;
        return `<div>${labelHtml}${input}</div>`;
      }).join("");
      const btnStyle = `background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;border:none;cursor:pointer;font-size:1rem`;
      return `<div style="${wrapStyle}"><form ${action} style="${formStyle}">${fieldsHtml}<button type="submit" style="${btnStyle}">${escHtml(submitLabel)}</button></form></div>`;
    }

    case "gallery": {
      const { images, columns, gap, showCaptions, borderRadius } = block.props;
      const gridStyle = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:${gap}px`;
      const itemsHtml = images.map((img) => {
        const imgStyle = `width:100%;object-fit:cover;aspect-ratio:4/3;display:block${borderRadius ? `;border-radius:${borderRadius}px` : ""}`;
        const caption = showCaptions && img.caption ? `<p style="font-size:0.8rem;color:#64748b;padding:4px 0;text-align:center">${escHtml(img.caption)}</p>` : "";
        return img.src ? `<div style="overflow:hidden${borderRadius ? `;border-radius:${borderRadius}px` : ""}"><img src="${escAttr(img.src)}" alt="${escAttr(img.alt)}" style="${imgStyle}">${caption}</div>` : "";
      }).join("");
      return `<div style="${gridStyle}">${itemsHtml}</div>`;
    }

    case "container": {
      const { backgroundColor, paddingTop, paddingBottom, paddingLeft, paddingRight, maxWidth, children } = block.props;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`;
      const inner = children.map(generateBlockHTML).join("");
      return `<div style="${style}"><div style="max-width:${maxWidth ? `${maxWidth}px` : "none"};margin:0 auto">${inner}</div></div>`;
    }

    case "two-column": {
      const { gap, leftWidth, leftChildren, rightChildren, paddingTop, paddingBottom, backgroundColor } = block.props;
      const rightWidth = 100 - leftWidth;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const colStyle = (w: number) => `flex:0 0 calc(${w}% - ${gap / 2}px);min-width:200px`;
      const leftHtml = leftChildren.map(generateBlockHTML).join("");
      const rightHtml = rightChildren.map(generateBlockHTML).join("");
      return `<div style="${style}"><div style="display:flex;flex-wrap:wrap;gap:${gap}px"><div style="${colStyle(leftWidth)}">${leftHtml}</div><div style="${colStyle(rightWidth)}">${rightHtml}</div></div></div>`;
    }

    case "three-column": {
      const { gap, col1Children, col2Children, col3Children, paddingTop, paddingBottom, backgroundColor } = block.props;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const colStyle = `flex:1 1 0;min-width:180px`;
      return `<div style="${style}"><div style="display:flex;flex-wrap:wrap;gap:${gap}px"><div style="${colStyle}">${col1Children.map(generateBlockHTML).join("")}</div><div style="${colStyle}">${col2Children.map(generateBlockHTML).join("")}</div><div style="${colStyle}">${col3Children.map(generateBlockHTML).join("")}</div></div></div>`;
    }

    default:
      return "";
  }
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
