import type { MapBlock } from "../../types/blocks";

interface Props {
  block: MapBlock;
  isEditing?: boolean;
}

export default function MapBlock({ block, isEditing }: Props) {
  const { embedUrl, height, borderRadius, align, width } = block.props;

  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  if (!embedUrl) {
    return (
      <div style={{ display: "flex", justifyContent: alignMap[align] }}>
        <div
          style={{
            width: `${width}%`,
            height,
            background: "#e2e8f0",
            borderRadius: borderRadius ? `${borderRadius}px` : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: 14 }}>Enter a map embed URL in the properties panel</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align] }}>
      <div style={{ width: `${width}%`, borderRadius: borderRadius ? `${borderRadius}px` : undefined, overflow: "hidden", pointerEvents: isEditing ? "none" : "auto" }}>
        <iframe
          src={embedUrl}
          title="Map"
          width="100%"
          height={height}
          style={{ border: "none", display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
