import type { VideoBlock } from "../../types/blocks";

interface Props {
  block: VideoBlock;
  isEditing?: boolean;
}

function getEmbedUrl(url: string, videoType: string, autoplay: boolean, muted: boolean, loop: boolean, controls: boolean): string {
  if (videoType === "youtube") {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (!match) return "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
    if (loop) { params.set("loop", "1"); params.set("playlist", match[1]); }
    if (!controls) params.set("controls", "0");
    const q = params.toString();
    return `https://www.youtube.com/embed/${match[1]}${q ? `?${q}` : ""}`;
  }
  if (videoType === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (!match) return "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("muted", "1");
    if (loop) params.set("loop", "1");
    const q = params.toString();
    return `https://player.vimeo.com/video/${match[1]}${q ? `?${q}` : ""}`;
  }
  return url;
}

export default function VideoBlock({ block, isEditing }: Props) {
  const { url, videoType, aspectRatio, controls, autoplay, muted, loop, borderRadius, align, width } = block.props;

  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
  const [w, h] = aspectRatio.split("/").map(Number);
  const paddingBottom = `${(h / w) * 100}%`;

  if (!url) {
    return (
      <div
        style={{ display: "flex", justifyContent: alignMap[align] }}
      >
        <div
          style={{
            width: `${width}%`,
            background: "#1e293b",
            borderRadius: borderRadius ? `${borderRadius}px` : undefined,
            aspectRatio: aspectRatio.replace("/", " / "),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: 14 }}>Enter a video URL in the properties panel</span>
        </div>
      </div>
    );
  }

  if (videoType === "direct") {
    return (
      <div style={{ display: "flex", justifyContent: alignMap[align] }}>
        <div style={{ width: `${width}%`, borderRadius: borderRadius ? `${borderRadius}px` : undefined, overflow: "hidden" }}>
          <video
            src={url}
            controls={controls}
            autoPlay={autoplay && !isEditing}
            muted={muted}
            loop={loop}
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url, videoType, autoplay && !isEditing, muted, loop, controls);

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align] }}>
      <div style={{ width: `${width}%`, borderRadius: borderRadius ? `${borderRadius}px` : undefined, overflow: "hidden" }}>
        <div style={{ position: "relative", paddingBottom, height: 0 }}>
          <iframe
            src={embedUrl}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
