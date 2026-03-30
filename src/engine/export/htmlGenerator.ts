import type { Project, Page, Section } from "../../types/project";
import type { Block } from "../../types/blocks";
import { generateCSS } from "./cssGenerator";
import { generateJS } from "./jsGenerator";

export interface GeneratedFile {
  relativePath: string;
  content: string;
}

/** Generate a standalone preview HTML string for a single page with inlined CSS/JS. */
export function generatePagePreview(page: Page, project: Project): string {
  const css = generateCSS(project.theme);
  const js = generateJS();
  const title = page.title ?? `${page.name} | ${project.name}`;
  const lang = project.lang ?? "en";

  const hasNav = (sec: Section) => sec.blocks.some((b) => b.type === "navigation");
  const hasFooter = (sec: Section) => sec.blocks.some((b) => b.type === "footer");
  const mainSections = page.sections.filter((s) => !hasNav(s) && !hasFooter(s));
  const body = page.sections.map((sec) => generateSectionHTML(sec, project, mainSections.indexOf(sec) === 0)).join("\n");

  return `<!DOCTYPE html>
<html lang="${escAttr(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(project.theme.headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(project.theme.bodyFont)}:wght@400;600&display=swap">
  <style>${css}</style>
</head>
<body>
${body}
<script>${js}</script>
</body>
</html>`;
}

export function exportProject(project: Project): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const minify = project.exportSettings.minify;
  const css = generateCSS(project.theme);
  const js = generateJS();

  files.push({ relativePath: "css/style.css", content: minify ? minifyCSS(css) : css });
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
    const html = generatePageHTML(page, project);
    files.push({ relativePath: filename, content: minify ? minifyHTML(html) : html });
  }

  // Sitemap
  const baseUrl = project.siteUrl?.replace(/\/$/, "") ?? "";
  const sitemap = generateSitemap(project.pages, baseUrl);
  files.push({ relativePath: "sitemap.xml", content: sitemap });

  return files;
}

function generatePageHTML(page: Page, project: Project): string {
  const title = page.title ?? `${page.name} | ${project.name}`;
  const metaDesc = page.metaDescription ?? project.description ?? "";
  const ogTitle = page.ogTitle ?? title;
  const ogDesc = page.ogDescription ?? metaDesc;
  const ogImage = page.ogImage ?? "";
  const lang = project.lang ?? "en";

  // Determine which sections are nav/footer for semantic HTML
  const hasNav = (sec: Section) => sec.blocks.some((b) => b.type === "navigation");
  const hasFooter = (sec: Section) => sec.blocks.some((b) => b.type === "footer");
  const mainSections = page.sections.filter((s) => !hasNav(s) && !hasFooter(s));
  const body = page.sections.map((sec) => generateSectionHTML(sec, project, mainSections.indexOf(sec) === 0)).join("\n");

  const seoMeta = [
    metaDesc ? `  <meta name="description" content="${escAttr(metaDesc)}">` : "",
    `  <meta property="og:title" content="${escAttr(ogTitle)}">`,
    ogDesc ? `  <meta property="og:description" content="${escAttr(ogDesc)}">` : "",
    ogImage ? `  <meta property="og:image" content="${escAttr(ogImage)}">` : "",
    `  <meta property="og:type" content="website">`,
  ].filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<html lang="${escAttr(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
${seoMeta}
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

function generateSectionHTML(section: Section, project: Project, _isFirst?: boolean): string {
  const style = [
    section.backgroundColor ? `background-color:${section.backgroundColor}` : "",
    `padding:${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px`,
  ].filter(Boolean).join(";");

  const inner = section.blocks.map(generateBlockHTML).join("\n");
  const maxW = section.fullWidth ? "none" : `${section.maxWidth ?? project.theme.maxWidth}px`;

  // Use semantic wrappers based on content
  const hasNav = section.blocks.some((b) => b.type === "navigation");
  const hasFooter = section.blocks.some((b) => b.type === "footer");
  const tag = hasNav ? "header" : hasFooter ? "footer" : "section";

  return `<${tag} style="${style}"><div style="max-width:${maxW};margin:0 auto">${inner}</div></${tag}>`;
}

function generateBlockHTML(block: Block): string {
  const html = generateBlockInnerHTML(block);
  // Wrap with cornerRadius if set
  if (block.cornerRadius !== undefined && block.cornerRadius > 0) {
    return `<div style="border-radius:${block.cornerRadius}px;overflow:hidden">${html}</div>`;
  }
  return html;
}

function generateBlockInnerHTML(block: Block): string {
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
      const { fields, submitLabel, backgroundColor, paddingTop, paddingBottom, submitMode, formspreeEndpoint, netlifyFormName, recipientEmail, successMessage } = block.props;
      const wrapStyle = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const formStyle = `max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px`;
      const inputStyle = `width:100%;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:0.9rem;box-sizing:border-box`;

      let formAttrs = `style="${formStyle}" data-sp-form data-success="${escAttr(successMessage ?? "Thank you!")}"`;
      if (submitMode === "formspree" && formspreeEndpoint) {
        formAttrs += ` action="${escAttr(formspreeEndpoint)}" method="POST" data-sp-formspree`;
      } else if (submitMode === "netlify") {
        const name = netlifyFormName || "contact";
        formAttrs += ` name="${escAttr(name)}" method="POST" data-netlify="true" netlify-honeypot="bot-field"`;
      } else if (submitMode === "mailto" && recipientEmail) {
        formAttrs += ` action="mailto:${escAttr(recipientEmail)}" method="POST" enctype="text/plain"`;
      }

      const honeypot = submitMode === "netlify" ? `<input type="hidden" name="form-name" value="${escAttr(netlifyFormName || "contact")}"><p hidden><label>Don't fill this out: <input name="bot-field"></label></p>` : "";

      const fieldsHtml = fields.map((f) => {
        const labelHtml = `<label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:4px">${escHtml(f.label)}${f.required ? '<span style="color:#ef4444;margin-left:2px">*</span>' : ""}</label>`;
        let input: string;
        if (f.type === "textarea") {
          input = `<textarea name="${escAttr(f.id)}" placeholder="${escAttr(f.label)}" rows="4" ${f.required ? "required" : ""} style="${inputStyle}"></textarea>`;
        } else if (f.type === "select") {
          const opts = (f.selectOptions ?? "").split(",").map((o) => o.trim()).filter(Boolean);
          const optionsHtml = [`<option value="">${escHtml(f.placeholder ?? "-- Select --")}</option>`, ...opts.map((o) => `<option value="${escAttr(o)}">${escHtml(o)}</option>`)].join("");
          input = `<select name="${escAttr(f.id)}" ${f.required ? "required" : ""} style="${inputStyle}">${optionsHtml}</select>`;
        } else {
          input = `<input type="${f.type}" name="${escAttr(f.id)}" placeholder="${escAttr(f.label)}" ${f.required ? "required" : ""} style="${inputStyle}">`;
        }
        return `<div>${labelHtml}${input}</div>`;
      }).join("");

      const btnStyle = `background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;border:none;cursor:pointer;font-size:1rem`;
      return `<div style="${wrapStyle}"><form ${formAttrs}>${honeypot}${fieldsHtml}<button type="submit" style="${btnStyle}">${escHtml(submitLabel)}</button></form></div>`;
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

    case "slide-banner": {
      const { slides, autoplay, autoplayInterval, height, showArrows, showIndicators } = block.props;
      if (!slides || slides.length === 0) return "";
      const id = `slider-${block.id.replace(/[^a-z0-9]/gi, "")}`;
      const slidesHtml = slides.map((s: { backgroundImage?: string; backgroundColor?: string; heading?: string; subheading?: string; ctaLabel?: string; ctaHref?: string; overlayColor?: string }, i: number) => {
        const bg = s.backgroundImage ? `url(${escAttr(s.backgroundImage)}) center/cover no-repeat` : (s.backgroundColor ?? "#1e293b");
        const overlay = s.overlayColor ? `<div style="position:absolute;inset:0;background:${s.overlayColor}"></div>` : "";
        const content = `<div style="position:relative;z-index:1;text-align:center;color:#fff">
          ${s.heading ? `<h2 style="font-size:2rem;font-weight:700;margin:0 0 12px">${escHtml(s.heading)}</h2>` : ""}
          ${s.subheading ? `<p style="font-size:1.1rem;margin:0 0 20px;opacity:0.9">${escHtml(s.subheading)}</p>` : ""}
          ${s.ctaLabel && s.ctaHref ? `<a href="${escAttr(s.ctaHref)}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${escHtml(s.ctaLabel)}</a>` : ""}
        </div>`;
        return `<div class="${id}-slide" style="display:${i === 0 ? "flex" : "none"};min-height:${height}px;position:relative;background:${bg};align-items:center;justify-content:center">${overlay}${content}</div>`;
      }).join("");
      const dotsHtml = showIndicators ? `<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px">
        ${slides.map((_: unknown, i: number) => `<button onclick="slideTo_${id}(${i})" style="width:10px;height:10px;border-radius:50%;background:#fff;border:none;cursor:pointer;opacity:${i === 0 ? "1" : "0.5"}" id="${id}-dot-${i}"></button>`).join("")}
      </div>` : "";
      const arrowsHtml = showArrows ? `<button onclick="slidePrev_${id}()" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem">&#8249;</button>
        <button onclick="slideNext_${id}()" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem">&#8250;</button>` : "";
      const script = `<script>
(function(){
  var cur_${id}=0,total_${id}=${slides.length};
  function show_${id}(n){
    document.querySelectorAll('.${id}-slide').forEach(function(el,i){el.style.display=i===n?'flex':'none';});
    ${showIndicators ? `document.querySelectorAll('[id^="${id}-dot-"]').forEach(function(el,i){el.style.opacity=i===n?'1':'0.5';});` : ""}
    cur_${id}=n;
  }
  window.slideTo_${id}=function(n){show_${id}(n);};
  window.slidePrev_${id}=function(){show_${id}((cur_${id}-1+total_${id})%total_${id});};
  window.slideNext_${id}=function(){show_${id}((cur_${id}+1)%total_${id});};
  ${autoplay ? `setInterval(function(){show_${id}((cur_${id}+1)%total_${id});},${autoplayInterval ?? 4000});` : ""}
})();
</script>`;
      return `<div style="position:relative;overflow:hidden">${slidesHtml}${dotsHtml}${arrowsHtml}</div>${script}`;
    }

    case "divider": {
      const { variant, height, color, lineStyle, width, marginTop, marginBottom } = block.props;
      if (variant === "spacer") {
        return `<div style="height:${height}px;margin:${marginTop}px auto ${marginBottom}px"></div>`;
      }
      return `<hr style="border:none;border-top:${height}px ${lineStyle} ${color};width:${width};margin:${marginTop}px auto ${marginBottom}px">`;
    }

    case "video": {
      const { url, videoType, aspectRatio, controls, autoplay, muted, loop, borderRadius, align, width } = block.props;
      if (!url) return "";
      const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
      const wrapStyle = `display:flex;justify-content:${alignMap[align]}`;
      const innerStyle = `width:${width}%;aspect-ratio:${aspectRatio};overflow:hidden${borderRadius ? `;border-radius:${borderRadius}px` : ""}`;

      if (videoType === "youtube") {
        const match = url.match(/(?:v=|youtu\.be\/)([^&\s?]+)/);
        const vid = match ? match[1] : "";
        if (!vid) return "";
        const params = [`rel=0`, controls ? "controls=1" : "controls=0", autoplay ? "autoplay=1" : "", muted ? "mute=1" : "", loop ? `loop=1&playlist=${vid}` : ""].filter(Boolean).join("&");
        return `<div style="${wrapStyle}"><div style="${innerStyle}"><iframe src="https://www.youtube.com/embed/${escAttr(vid)}?${params}" style="width:100%;height:100%;border:none" allowfullscreen allow="autoplay"></iframe></div></div>`;
      }
      if (videoType === "vimeo") {
        const match = url.match(/vimeo\.com\/(\d+)/);
        const vid = match ? match[1] : "";
        if (!vid) return "";
        const params = [controls ? "" : "controls=0", autoplay ? "autoplay=1" : "", muted ? "muted=1" : "", loop ? "loop=1" : ""].filter(Boolean).join("&");
        return `<div style="${wrapStyle}"><div style="${innerStyle}"><iframe src="https://player.vimeo.com/video/${escAttr(vid)}?${params}" style="width:100%;height:100%;border:none" allowfullscreen allow="autoplay"></iframe></div></div>`;
      }
      // direct
      const videoAttr = [controls ? "controls" : "", autoplay ? "autoplay" : "", muted ? "muted" : "", loop ? "loop" : ""].filter(Boolean).join(" ");
      return `<div style="${wrapStyle}"><div style="${innerStyle}"><video src="${escAttr(url)}" ${videoAttr} style="width:100%;height:100%;object-fit:contain"></video></div></div>`;
    }

    case "hero": {
      const { heading, subheading, ctaLabel, ctaHref, ctaVariant, ctaSecondaryLabel, ctaSecondaryHref, backgroundImage, backgroundColor, overlayColor, headingColor, subheadingColor, textAlign, paddingTop, paddingBottom, minHeight } = block.props;
      const bg = backgroundImage ? `url(${escAttr(backgroundImage)}) center/cover no-repeat` : backgroundColor;
      const overlay = overlayColor ? `<div style="position:absolute;inset:0;background:${overlayColor}"></div>` : "";
      const ctaBgMap: Record<string, string> = { primary: "#2563eb", outline: "transparent" };
      const ctaColorMap: Record<string, string> = { primary: "#fff", outline: "#fff" };
      const ctaBorderMap: Record<string, string> = { primary: "#2563eb", outline: "#fff" };
      const primaryBtn = ctaLabel && ctaHref ? `<a href="${escAttr(ctaHref)}" style="display:inline-block;padding:14px 32px;background:${ctaBgMap[ctaVariant ?? "primary"]};color:${ctaColorMap[ctaVariant ?? "primary"]};border:2px solid ${ctaBorderMap[ctaVariant ?? "primary"]};border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem">${escHtml(ctaLabel)}</a>` : "";
      const secondaryBtn = ctaSecondaryLabel && ctaSecondaryHref ? `<a href="${escAttr(ctaSecondaryHref)}" style="display:inline-block;padding:14px 32px;background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem">${escHtml(ctaSecondaryLabel)}</a>` : "";
      const btns = (primaryBtn || secondaryBtn) ? `<div style="display:flex;gap:12px;justify-content:${textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center"};flex-wrap:wrap;margin-top:24px">${primaryBtn}${secondaryBtn}</div>` : "";
      return `<section style="position:relative;background:${bg};min-height:${minHeight}px;display:flex;align-items:center;justify-content:${textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center"}">
  ${overlay}
  <div style="position:relative;z-index:1;padding:${paddingTop}px 24px ${paddingBottom}px;text-align:${textAlign};max-width:800px;margin:0 auto">
    ${heading ? `<h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;color:${headingColor};margin:0 0 16px;line-height:1.1">${escHtml(heading)}</h1>` : ""}
    ${subheading ? `<p style="font-size:clamp(1rem,2.5vw,1.25rem);color:${subheadingColor};margin:0;opacity:0.9;line-height:1.6">${escHtml(subheading)}</p>` : ""}
    ${btns}
  </div>
</section>`;
    }

    case "testimonial": {
      const { items, columns, backgroundColor, cardColor, quoteColor, authorColor, showRating, paddingTop, paddingBottom } = block.props;
      const wrapStyle = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const gridStyle = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:24px`;
      const cardsHtml = items.map((item: { quote: string; authorName: string; authorTitle?: string; authorAvatar?: string; rating: number }) => {
        const stars = showRating ? `<div style="display:flex;gap:2px;margin-bottom:12px">${Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < item.rating ? "#f59e0b" : "#cbd5e1"};font-size:1rem">★</span>`).join("")}</div>` : "";
        const avatar = item.authorAvatar
          ? `<img src="${escAttr(item.authorAvatar)}" alt="${escAttr(item.authorName)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
          : `<div style="width:40px;height:40px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${escHtml(item.authorName.charAt(0))}</div>`;
        return `<div style="background:${cardColor};border-radius:12px;padding:24px">
          ${stars}
          <p style="color:${quoteColor};font-size:1rem;line-height:1.7;margin:0 0 16px;font-style:italic">"${escHtml(item.quote)}"</p>
          <div style="display:flex;align-items:center;gap:12px">${avatar}<div><p style="font-weight:600;color:${authorColor};margin:0;font-size:0.9rem">${escHtml(item.authorName)}</p>${item.authorTitle ? `<p style="color:${authorColor};opacity:0.7;margin:0;font-size:0.8rem">${escHtml(item.authorTitle)}</p>` : ""}</div></div>
        </div>`;
      }).join("");
      return `<div style="${wrapStyle}"><div style="${gridStyle}">${cardsHtml}</div></div>`;
    }

    case "pricing-table": {
      const { plans, backgroundColor, paddingTop, paddingBottom } = block.props;
      const wrapStyle = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const plansHtml = plans.map((plan: { name: string; price: string; period?: string; description?: string; features: { id: string; text: string; included: boolean }[]; ctaLabel: string; ctaHref?: string; highlighted: boolean; highlightColor?: string }) => {
        const cardStyle = `position:relative;border-radius:12px;padding:32px 24px;border:2px solid ${plan.highlighted ? (plan.highlightColor ?? "#2563eb") : "#e2e8f0"};background:${plan.highlighted ? (plan.highlightColor ?? "#2563eb") : "#fff"};color:${plan.highlighted ? "#fff" : "#1e293b"};flex:1 1 280px;max-width:360px`;
        const badge = plan.highlighted ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:0.75rem;font-weight:600;padding:4px 12px;border-radius:20px;white-space:nowrap">Most Popular</div>` : "";
        const featuresHtml = plan.features.map((f) => `<li style="display:flex;align-items:center;gap:8px;padding:6px 0;opacity:${f.included ? "1" : "0.45"}"><span style="color:${f.included ? "#22c55e" : "#ef4444"};font-weight:700">${f.included ? "✓" : "✕"}</span>${escHtml(f.text)}</li>`).join("");
        const btn = plan.ctaHref ? `<a href="${escAttr(plan.ctaHref)}" style="display:block;text-align:center;padding:12px;background:${plan.highlighted ? "#fff" : (plan.highlightColor ?? "#2563eb")};color:${plan.highlighted ? (plan.highlightColor ?? "#2563eb") : "#fff"};border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">${escHtml(plan.ctaLabel)}</a>` : "";
        return `<div style="${cardStyle}">${badge}<h3 style="font-size:1.25rem;font-weight:700;margin:0 0 8px">${escHtml(plan.name)}</h3>${plan.description ? `<p style="opacity:0.8;margin:0 0 16px;font-size:0.9rem">${escHtml(plan.description)}</p>` : ""}<p style="font-size:2.5rem;font-weight:800;margin:0 0 4px">${escHtml(plan.price)}<span style="font-size:1rem;font-weight:400;opacity:0.7">/${escHtml(plan.period ?? "mo")}</span></p><ul style="list-style:none;padding:0;margin:16px 0 0">${featuresHtml}</ul>${btn}</div>`;
      }).join("");
      return `<div style="${wrapStyle}"><div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center">${plansHtml}</div></div>`;
    }

    case "icon": {
      const { iconName, size, color, align, label, labelColor, href } = block.props;
      const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
      const ICON_PATHS: Record<string, string> = {
        star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
        heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
        check: "M4.5 12.75l6 6 9-13.5",
        "check-circle": "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
        shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
        globe: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
        mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
        phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
        "map-pin": "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
        "arrow-right": "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
        download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
        home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
      };
      const path = ICON_PATHS[iconName] ?? ICON_PATHS.star;
      const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="${escAttr(color)}" style="width:${size}px;height:${size}px"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${escAttr(path)}"/></svg>`;
      const labelHtml = label ? `<span style="color:${escAttr(labelColor ?? color)};font-size:0.875rem;font-weight:500">${escHtml(label)}</span>` : "";
      const inner = `<div style="display:flex;flex-direction:column;align-items:${alignMap[align] ?? "center"};gap:8px">${svgHtml}${labelHtml}</div>`;
      if (href) {
        return `<a href="${escAttr(href)}" style="text-decoration:none;display:block">${inner}</a>`;
      }
      return inner;
    }

    case "map": {
      const { embedUrl, height, borderRadius, align, width } = block.props;
      if (!embedUrl) return "";
      const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
      const wrapStyle = `display:flex;justify-content:${alignMap[align] ?? "center"}`;
      const iframeStyle = `width:${width ?? 100}%;height:${height}px;border:none${borderRadius ? `;border-radius:${borderRadius}px` : ""}`;
      return `<div style="${wrapStyle}"><iframe src="${escAttr(embedUrl)}" style="${iframeStyle}" allowfullscreen loading="lazy"></iframe></div>`;
    }

    case "four-column": {
      const { gap, col1Children, col2Children, col3Children, col4Children, paddingTop, paddingBottom, backgroundColor } = block.props;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const colStyle = `flex:1 1 0;min-width:150px`;
      return `<div style="${style}"><div style="display:flex;flex-wrap:wrap;gap:${gap}px"><div style="${colStyle}">${col1Children.map(generateBlockHTML).join("")}</div><div style="${colStyle}">${col2Children.map(generateBlockHTML).join("")}</div><div style="${colStyle}">${col3Children.map(generateBlockHTML).join("")}</div><div style="${colStyle}">${col4Children.map(generateBlockHTML).join("")}</div></div></div>`;
    }

    case "asymmetric-column": {
      const { gap, leftWidth, leftChildren, rightChildren, paddingTop, paddingBottom, backgroundColor, leftVerticalAlign, rightVerticalAlign } = block.props;
      const rightWidth = 100 - leftWidth;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const vMap: Record<string, string> = { top: "flex-start", center: "center", bottom: "flex-end" };
      const lStyle = `flex:0 0 calc(${leftWidth}% - ${gap / 2}px);min-width:200px;display:flex;flex-direction:column;justify-content:${vMap[leftVerticalAlign ?? "top"]}`;
      const rStyle = `flex:0 0 calc(${rightWidth}% - ${gap / 2}px);min-width:200px;display:flex;flex-direction:column;justify-content:${vMap[rightVerticalAlign ?? "top"]}`;
      return `<div style="${style}"><div style="display:flex;flex-wrap:wrap;gap:${gap}px;align-items:stretch"><div style="${lStyle}">${leftChildren.map(generateBlockHTML).join("")}</div><div style="${rStyle}">${rightChildren.map(generateBlockHTML).join("")}</div></div></div>`;
    }

    case "vertical-stack": {
      const { gap, align, showDivider, dividerColor, backgroundColor, paddingTop, paddingBottom, paddingLeft, paddingRight, children } = block.props;
      const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;display:flex;flex-direction:column;gap:${gap}px;align-items:${alignMap[align ?? "stretch"]}`;
      const inner = children.map((b: Block, i: number) => {
        const divider = showDivider && i < children.length - 1 ? `<hr style="border:none;border-top:1px solid ${dividerColor};margin:0;width:100%">` : "";
        return `<div style="width:${align === "stretch" ? "100%" : "auto"}">${generateBlockHTML(b)}</div>${divider}`;
      }).join("");
      return `<div style="${style}">${inner}</div>`;
    }

    case "masonry-grid": {
      const { columns, gap, backgroundColor, paddingTop, paddingBottom, items } = block.props;
      const style = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const gridStyle = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:${gap}px;align-items:start`;
      const colsHtml = (items as Block[][]).map((col) => `<div style="display:flex;flex-direction:column;gap:${gap}px">${col.map(generateBlockHTML).join("")}</div>`).join("");
      return `<div style="${style}"><div style="${gridStyle}">${colsHtml}</div></div>`;
    }

    case "product-card": {
      const { name, description, price, imageSrc, imageAlt, badge, ctaLabel, ctaHref, ctaTarget, paddingTop, paddingBottom, borderRadius, shadow, outlined, backgroundColor } = block.props;
      const cardStyle = `background:${backgroundColor};border-radius:${borderRadius}px;overflow:hidden;${shadow ? "box-shadow:0 4px 24px rgba(0,0,0,0.10);" : ""}${outlined ? "border:1px solid #e2e8f0;" : ""}padding-bottom:${paddingBottom}px`;
      const imgHtml = imageSrc ? `<img src="${escAttr(imageSrc)}" alt="${escAttr(imageAlt)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">` : "";
      const badgeHtml = badge ? `<span style="position:absolute;top:12px;left:12px;background:#f59e0b;color:#fff;font-size:0.75rem;font-weight:700;padding:3px 10px;border-radius:20px">${escHtml(badge)}</span>` : "";
      const bodyHtml = `<div style="padding:${paddingTop}px 16px 0"><h3 style="margin:0 0 6px;font-size:1rem;font-weight:700">${escHtml(name)}</h3>${description ? `<p style="margin:0 0 10px;font-size:0.875rem;line-height:1.5;opacity:0.8">${escHtml(description)}</p>` : ""}<p style="margin:0 0 14px;font-size:1.25rem;font-weight:800">${escHtml(price)}</p>${ctaLabel ? `<a href="${escAttr(ctaHref)}" target="${ctaTarget}" style="display:block;text-align:center;background:#2563eb;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem">${escHtml(ctaLabel)}</a>` : ""}</div>`;
      return `<div style="${cardStyle}"><div style="position:relative">${imgHtml}${badgeHtml}</div>${bodyHtml}</div>`;
    }

    case "product-grid": {
      const { items, columns, gap, paddingTop, paddingBottom, cardStyle, borderRadius, backgroundColor } = block.props;
      const wrapStyle = `background:${backgroundColor ?? "transparent"};padding:${paddingTop}px 0 ${paddingBottom}px`;
      const gridStyle2 = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:${gap}px`;
      const shadow = cardStyle === "shadowed" ? "box-shadow:0 4px 24px rgba(0,0,0,0.10);" : "";
      const border = cardStyle === "outlined" ? "border:1px solid #e2e8f0;" : "";
      const cardsHtml = (items as Array<{ name: string; description: string; price: string; imageSrc: string; imageAlt: string; badge?: string; ctaLabel: string; ctaHref: string; ctaTarget: string; id: string }>).map((item) => {
        const imgHtml = item.imageSrc ? `<img src="${escAttr(item.imageSrc)}" alt="${escAttr(item.imageAlt)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">` : "";
        const badgeHtml = item.badge ? `<span style="position:absolute;top:10px;left:10px;background:#f59e0b;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px">${escHtml(item.badge)}</span>` : "";
        return `<div style="background:#fff;border-radius:${borderRadius}px;overflow:hidden;${shadow}${border}padding-bottom:16px"><div style="position:relative">${imgHtml}${badgeHtml}</div><div style="padding:12px 14px 4px"><h3 style="margin:0 0 4px;font-size:0.95rem;font-weight:700">${escHtml(item.name)}</h3>${item.description ? `<p style="margin:0 0 8px;font-size:0.8rem;line-height:1.5;opacity:0.8">${escHtml(item.description)}</p>` : ""}<p style="margin:0 0 10px;font-size:1.1rem;font-weight:800">${escHtml(item.price)}</p>${item.ctaLabel ? `<a href="${escAttr(item.ctaHref)}" target="${item.ctaTarget}" style="display:block;text-align:center;background:#2563eb;color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem">${escHtml(item.ctaLabel)}</a>` : ""}</div></div>`;
      }).join("");
      return `<div style="${wrapStyle}"><div style="${gridStyle2}">${cardsHtml}</div></div>`;
    }

    case "product-detail": {
      const { name, description, price, imageSrc, imageAlt, badge, ctaLabel, ctaHref, ctaTarget, features, layout, galleryImages, backgroundColor, paddingTop, paddingBottom, accentColor } = block.props;
      const allImgs = [imageSrc, ...(galleryImages ?? [])].filter(Boolean);
      const imgHtml = allImgs.length > 0
        ? `<img src="${escAttr(allImgs[0])}" alt="${escAttr(imageAlt)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;display:block">`
        : `<div style="width:100%;aspect-ratio:4/3;background:#f1f5f9;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#94a3b8">No image</div>`;
      const badgeHtml = badge ? `<span style="position:absolute;top:14px;left:14px;background:${accentColor ?? "#f59e0b"};color:#fff;font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:20px">${escHtml(badge)}</span>` : "";
      const galleryHtml = allImgs.length > 1 ? `<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${allImgs.map((src) => `<img src="${escAttr(src)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:2px solid #e2e8f0">`).join("")}</div>` : "";
      const featuresHtml = features && features.length > 0 ? `<ul style="list-style:none;padding:0;margin:0 0 24px">${features.map((f: string) => `<li style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:0.9rem"><span style="color:${accentColor ?? "#f59e0b"};font-weight:700">✓</span>${escHtml(f)}</li>`).join("")}</ul>` : "";
      const btnHtml = ctaLabel ? `<a href="${escAttr(ctaHref)}" target="${ctaTarget}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem">${escHtml(ctaLabel)}</a>` : "";
      const imgSection = `<div style="flex:1 1 50%;min-width:280px"><div style="position:relative">${imgHtml}${badgeHtml}</div>${galleryHtml}</div>`;
      const infoSection = `<div style="flex:1 1 50%;min-width:280px"><h2 style="margin:0 0 10px;font-size:1.75rem;font-weight:800">${escHtml(name)}</h2><p style="margin:0 0 16px;font-size:2rem;font-weight:800;color:#2563eb">${escHtml(price)}</p>${description ? `<p style="margin:0 0 20px;font-size:1rem;line-height:1.7;opacity:0.85">${escHtml(description)}</p>` : ""}${featuresHtml}${btnHtml}</div>`;
      const isTop = layout === "image-top";
      const isRight = layout === "image-right";
      const innerStyle = isTop ? "display:flex;flex-direction:column;gap:24px;max-width:800px;margin:0 auto" : `display:flex;flex-wrap:wrap;gap:40px;max-width:1100px;margin:0 auto${isRight ? ";flex-direction:row-reverse" : ""}`;
      return `<div style="background:${backgroundColor};padding:${paddingTop}px 16px ${paddingBottom}px"><div style="${innerStyle}">${isRight ? infoSection + imgSection : imgSection + infoSection}</div></div>`;
    }

    case "cart-button": {
      const { position, backgroundColor: bgColor, iconColor, label } = block.props;
      const posStyle = position === "inline" ? "display:inline-flex" : `position:fixed;${position === "fixed-bottom-left" ? "left:24px" : "right:24px"};bottom:24px;z-index:1000`;
      const btnStyle = `background:${bgColor ?? "#2563eb"};color:${iconColor ?? "#fff"};border:none;border-radius:50px;padding:12px 20px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:0.95rem;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.18)`;
      return `<div style="${posStyle}"><button id="stackpage-cart-btn" onclick="toggleStackpageCart()" style="${btnStyle}"><span style="font-size:1.2rem">🛒</span>${label ? `<span>${escHtml(label)}</span>` : ""}<span id="stackpage-cart-count" style="background:#ef4444;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800">0</span></button></div>`;
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

function generateSitemap(pages: Page[], baseUrl: string): string {
  const urls = pages.map((p) => {
    const loc = p.slug === "index" ? `${baseUrl}/` : `${baseUrl}/${p.slug}.html`;
    return `  <url><loc>${loc}</loc></url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function minifyHTML(html: string): string {
  return html
    .replace(/<!--(?!<!)[\s\S]*?-->/g, "") // remove HTML comments (except IE conditionals)
    .replace(/>\s+</g, "><")               // collapse whitespace between tags
    .replace(/\s{2,}/g, " ")              // collapse multiple spaces
    .replace(/\n/g, "")                    // remove newlines
    .trim();
}

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")     // remove comments
    .replace(/\s*([{};:,>+~])\s*/g, "$1") // remove spaces around symbols
    .replace(/\s{2,}/g, " ")              // collapse whitespace
    .replace(/\n/g, "")                    // remove newlines
    .trim();
}
