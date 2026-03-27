import html2canvas from "html2canvas";

/**
 * Captures the current editor canvas DOM node as a 400×225 thumbnail (16:9).
 * Returns a base64 PNG data URL or null on failure.
 */
export async function captureEditorThumbnail(): Promise<string | null> {
  // The canvas is the scrollable content area inside the editor
  const canvasEl = document.querySelector<HTMLElement>("[data-canvas-root]");
  if (!canvasEl) return null;

  try {
    const canvas = await html2canvas(canvasEl, {
      width: canvasEl.scrollWidth,
      height: canvasEl.scrollHeight,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#f8fafc",
    });

    // Resize to 400×225
    const thumb = document.createElement("canvas");
    thumb.width = 400;
    thumb.height = 225;
    const ctx = thumb.getContext("2d");
    if (!ctx) return null;

    // Cover-fit: crop & scale
    const srcAspect = canvas.width / canvas.height;
    const dstAspect = 400 / 225;
    let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
    if (srcAspect > dstAspect) {
      sw = Math.round(canvas.height * dstAspect);
      sx = Math.round((canvas.width - sw) / 2);
    } else {
      sh = Math.round(canvas.width / dstAspect);
      sy = Math.round((canvas.height - sh) / 2);
    }
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 400, 225);

    return thumb.toDataURL("image/png");
  } catch {
    return null;
  }
}
